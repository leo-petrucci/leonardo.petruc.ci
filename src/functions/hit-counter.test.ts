import { afterAll, beforeAll, expect, mock, test } from 'bun:test';

let storedCount = 41;
let dynamoAvailable = true;
const commands: Array<{ input: Record<string, unknown> }> = [];

class UpdateItemCommand {
  constructor(readonly input: Record<string, unknown>) {}
}

class GetItemCommand {
  constructor(readonly input: Record<string, unknown>) {}
}

class DynamoDBClient {
  async send(command: UpdateItemCommand | GetItemCommand) {
    commands.push(command);
    if (!dynamoAvailable) throw new Error('DynamoDB unavailable');

    if (command instanceof UpdateItemCommand) {
      storedCount += 1;
      return { Attributes: { hits: { N: String(storedCount) } } };
    }

    return { Item: { hits: { N: String(storedCount) } } };
  }
}

mock.module('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
}));

const originalEnvironment = { ...process.env };
const originalConsoleError = console.error;

process.env.TABLE_NAME = 'hits';
process.env.ALLOWED_HOST = 'example.com';
process.env.FALLBACK_COUNT = '7';
process.env.PAD_WIDTH = '6';
process.env.LAMBDA_TASK_ROOT = '/tmp/lambda-package';

const { handler } = await import('./hit-counter');

beforeAll(() => {
  console.error = mock(() => {});
});

afterAll(() => {
  process.env = originalEnvironment;
  console.error = originalConsoleError;
});

function request(headers: Record<string, string> = {}, method = 'GET') {
  return handler({
    headers,
    requestContext: { http: { method } },
  });
}

function expectSvg(response: Awaited<ReturnType<typeof handler>>) {
  expect(response.statusCode).toBe(200);
  expect(response.headers['content-type']).toBe('image/svg+xml');
  expect(response.headers['cache-control']).toContain('no-store');
  expect(response.body).toStartWith('<svg');
  expect(response.body).toContain('@font-face{font-family:PerfectDOS');
  expect(response.body).toContain('font-family="PerfectDOS, monospace"');
  expect(response.body).toContain('fill="#FAF0CC"');
}

test('serves a cold read for curl, then serves later rejected requests from cache', async () => {
  const curl = await request({ 'user-agent': 'curl/8.0' });
  expectSvg(curl);
  expect(commands).toHaveLength(1);
  expect(commands[0]).toBeInstanceOf(GetItemCommand);

  const document = await request({
    'user-agent': 'Mozilla/5.0',
    referer: 'https://example.com/page',
    'sec-fetch-dest': 'document',
  });
  expectSvg(document);
  expect(commands).toHaveLength(1);

  const head = await request(
    {
      'user-agent': 'Mozilla/5.0',
      referer: 'https://example.com/page',
      'sec-fetch-dest': 'image',
    },
    'HEAD'
  );
  expectSvg(head);
  expect(commands).toHaveLength(1);
});

test('counts concurrent browser image loads with atomic ADD updates', async () => {
  const browserHeaders = {
    'user-agent': 'Mozilla/5.0',
    referer: 'https://example.com/page',
  };
  const before = storedCount;
  const [first, second] = await Promise.all([
    request(browserHeaders),
    request(browserHeaders),
  ]);

  expectSvg(first);
  expectSvg(second);
  expect(storedCount).toBe(before + 2);

  const updates = commands.slice(-2);
  expect(updates.every((command) => command instanceof UpdateItemCommand)).toBe(true);
  expect(updates[0].input).toMatchObject({
    TableName: 'hits',
    Key: { pk: { S: 'site:total' } },
    UpdateExpression: 'ADD hits :one',
    ExpressionAttributeValues: { ':one': { N: '1' } },
    ReturnValues: 'UPDATED_NEW',
  });
});

test('does not count bot user agents and still returns an image when DynamoDB fails', async () => {
  const before = commands.length;
  const bot = await request({
    'user-agent': 'facebookexternalhit/1.1',
    referer: 'https://example.com/page',
  });
  expectSvg(bot);
  expect(commands).toHaveLength(before);

  dynamoAvailable = false;
  const failedIncrement = await request({
    'user-agent': 'Mozilla/5.0',
    referer: 'https://example.com/page',
    'sec-fetch-dest': 'image',
  });
  expectSvg(failedIncrement);
  dynamoAvailable = true;
});

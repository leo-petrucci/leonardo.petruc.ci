import { afterAll, beforeAll, expect, mock, test } from 'bun:test';

let requests = 0;
let shouldFail = false;

class MockWebflowClient {
  collections = {
    items: {
      listItemsLive: async () => {
        requests += 1;

        if (shouldFail) {
          throw new Error('Webflow is unavailable');
        }

        return {
          items: [
            {
              id: 'article-1',
              fieldData: { body: '<p>one two</p>' },
            },
          ],
          pagination: { total: 1 },
        };
      },
    },
  };
}

mock.module('webflow-api', () => ({ WebflowClient: MockWebflowClient }));

const { handler } = await import('../../src/functions/webflow-word-count');
const originalNow = Date.now;
const originalEnvironment = { ...process.env };
const originalConsoleError = console.error;

beforeAll(() => {
  console.error = mock(() => {});
  process.env.WEBFLOW_API_TOKEN = 'test-token';
  process.env.COLLECTION_ID = 'collection-id';
  process.env.BODY_FIELD = 'body';
  process.env.ALLOWED_ORIGIN = 'https://example.webflow.io';
});

afterAll(() => {
  Date.now = originalNow;
  console.error = originalConsoleError;
  process.env = originalEnvironment;
});

test('uses fresh cache and serves stale data after a refresh failure', async () => {
  Date.now = () => 1_000;

  const first = await handler();
  expect(first.statusCode).toBe(200);
  expect(JSON.parse(first.body)).toEqual({
    total: 2,
    articles: 1,
    computedAt: '1970-01-01T00:00:01.000Z',
  });
  expect(requests).toBe(1);

  const cached = await handler();
  expect(cached.statusCode).toBe(200);
  expect(requests).toBe(1);

  shouldFail = true;
  Date.now = () => 3_601_001;

  const stale = await handler();
  expect(stale.statusCode).toBe(200);
  expect(JSON.parse(stale.body)).toEqual({
    total: 2,
    articles: 1,
    computedAt: '1970-01-01T00:00:01.000Z',
    stale: true,
  });
  expect(requests).toBe(2);
});

import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ddb = new DynamoDBClient({});
const TABLE = process.env.TABLE_NAME;
const ALLOWED_HOST = process.env.ALLOWED_HOST ?? '';
const FALLBACK_COUNT = Number(process.env.FALLBACK_COUNT ?? 0);
const PAD = Number(process.env.PAD_WIDTH ?? 6);
const BOT_UA =
  /bot|crawl|spider|slurp|curl|wget|python|java|go-http|headless|phantom|monitor|uptime|scrape|preview|embedly|facebookexternalhit/i;

let lastKnownCount: number | null = null;

function loadFontDataUri() {
  try {
    const sourceFontPath = new URL(
      '../../Perfect DOS VGA 437-subset.ttf',
      import.meta.url
    );
    const fontPath = existsSync(sourceFontPath)
      ? sourceFontPath
      : join(process.env.LAMBDA_TASK_ROOT ?? process.cwd(), 'Perfect DOS VGA 437-subset.ttf');
    return `data:font/ttf;base64,${readFileSync(fontPath).toString('base64')}`;
  } catch (error) {
    console.error('Unable to load hit counter font:', error);
    return '';
  }
}

const fontDataUri = loadFontDataUri();

function looksHuman(headers: Record<string, string | undefined>) {
  const userAgent = headers['user-agent'] || '';
  if (!userAgent || BOT_UA.test(userAgent)) return false;

  const destination = headers['sec-fetch-dest'];
  if (destination && destination !== 'image') return false;

  const referer = headers.referer || '';
  return Boolean(ALLOWED_HOST) && referer.includes(ALLOWED_HOST);
}

function svgResponse(count: number) {
  const digits = String(count).padStart(PAD, '0').split('');
  const width = digits.length * 22;
  const cells = digits
    .map(
      (digit, index) => `
      <rect x="${index * 22 + 2}" y="2" width="18" height="30" fill="#111" stroke="#333"/>
      <text x="${index * 22 + 11}" y="25" font-family="PerfectDOS, monospace" font-size="20" fill="#FAF0CC" text-anchor="middle">${digit}</text>`
    )
    .join('');

  return {
    statusCode: 200,
    headers: {
      'content-type': 'image/svg+xml',
      'cache-control': 'no-store, no-cache, must-revalidate, max-age=0',
      pragma: 'no-cache',
      expires: '0',
    },
    body: `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="34">
    ${fontDataUri ? `<style>@font-face{font-family:PerfectDOS;src:url(${fontDataUri}) format('truetype')}</style>` : ''}
    <rect width="100%" height="100%" fill="#000"/>${cells}
  </svg>`,
  };
}

export const handler = async (event: {
  headers?: Record<string, string | undefined>;
  requestContext?: { http?: { method?: string } };
}) => {
  const headers = event.headers || {};
  const shouldCount =
    event.requestContext?.http?.method === 'GET' && looksHuman(headers);

  let count: number;
  try {
    if (shouldCount) {
      const result = await ddb.send(
        new UpdateItemCommand({
          TableName: TABLE,
          Key: { pk: { S: 'site:total' } },
          UpdateExpression: 'ADD hits :one',
          ExpressionAttributeValues: { ':one': { N: '1' } },
          ReturnValues: 'UPDATED_NEW',
        })
      );
      count = Number(result.Attributes?.hits?.N);
      lastKnownCount = count;
    } else if (lastKnownCount !== null) {
      count = lastKnownCount;
    } else {
      const result = await ddb.send(
        new GetItemCommand({
          TableName: TABLE,
          Key: { pk: { S: 'site:total' } },
        })
      );
      count = Number(result.Item?.hits?.N ?? FALLBACK_COUNT);
      lastKnownCount = count;
    }
  } catch (error) {
    console.error('Unable to read hit counter:', error);
    count = lastKnownCount ?? FALLBACK_COUNT;
  }

  return svgResponse(count);
};

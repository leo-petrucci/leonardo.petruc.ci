import { WebflowClient } from 'webflow-api';

import { countCollectionWords } from '../webflow/word-count';

const CACHE_TTL_MS = 60 * 60 * 1000;

type CachedCount = {
  total: number;
  articles: number;
  at: number;
};

let cache: CachedCount | undefined;

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} must be configured.`);
  }

  return value;
}

function response(
  statusCode: number,
  body: Record<string, unknown>,
  allowedOrigin: string
) {
  return {
    statusCode,
    headers: {
      'access-control-allow-origin': allowedOrigin,
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  };
}

export const handler = async () => {
  const allowedOrigin = requiredEnvironment('ALLOWED_ORIGIN');

  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return response(
      200,
      {
        total: cache.total,
        articles: cache.articles,
        computedAt: new Date(cache.at).toISOString(),
      },
      allowedOrigin
    );
  }

  try {
    const webflow = new WebflowClient({
      accessToken: requiredEnvironment('WEBFLOW_API_TOKEN'),
    });
    const result = await countCollectionWords(
      webflow,
      requiredEnvironment('COLLECTION_ID'),
      requiredEnvironment('BODY_FIELD')
    );

    cache = {
      total: result.total,
      articles: result.articles.length,
      at: Date.now(),
    };

    return response(
      200,
      {
        total: cache.total,
        articles: cache.articles,
        computedAt: new Date(cache.at).toISOString(),
      },
      allowedOrigin
    );
  } catch (error) {
    console.error('Unable to compute Webflow word count:', error);

    if (cache) {
      return response(
        200,
        {
          total: cache.total,
          articles: cache.articles,
          computedAt: new Date(cache.at).toISOString(),
          stale: true,
        },
        allowedOrigin
      );
    }

    return response(502, { error: 'Unable to compute word count.' }, allowedOrigin);
  }
};

import { WebflowClient } from 'webflow-api';

import { countCollectionWords } from '../../src/webflow/word-count';

function requiredEnvironment(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} must be configured.`);
  }

  return value;
}

const webflow = new WebflowClient({
  accessToken: requiredEnvironment('WEBFLOW_API_TOKEN'),
});
const result = await countCollectionWords(
  webflow,
  requiredEnvironment('COLLECTION_ID'),
  requiredEnvironment('BODY_FIELD')
);

for (const article of result.articles) {
  console.log(`${article.words}\t${article.title}\t(${article.id})`);
}

console.log(`Total words written: ${result.total.toLocaleString()}`);
console.log(`Published articles: ${result.articles.length}`);
console.log(`Webflow API requests: ${result.requests}`);

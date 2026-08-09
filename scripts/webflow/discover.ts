import { WebflowClient } from 'webflow-api';

const token = process.env.WEBFLOW_API_TOKEN?.trim();

if (!token) {
  throw new Error('WEBFLOW_API_TOKEN must be configured.');
}

const webflow = new WebflowClient({ accessToken: token });
const { sites = [] } = await webflow.sites.list();

for (const site of sites) {
  if (!site.id) {
    continue;
  }

  console.log(`Site: ${site.displayName ?? site.shortName ?? 'Untitled'} (${site.id})`);
  const { collections = [] } = await webflow.collections.list(site.id);

  for (const collection of collections) {
    if (!collection.id) {
      continue;
    }

    const fullCollection = await webflow.collections.get(collection.id);
    console.log(
      `  Collection: ${fullCollection.displayName ?? collection.displayName ?? 'Untitled'} (${collection.id})`
    );

    for (const field of fullCollection.fields ?? []) {
      const richText = field.type === 'RichText' ? ' [RichText: possible article body]' : '';
      console.log(`    ${field.type ?? 'Unknown'}: ${field.slug ?? 'no-slug'}${richText}`);
    }
  }
}

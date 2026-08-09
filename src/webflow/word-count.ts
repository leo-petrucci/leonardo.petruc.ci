export type WebflowArticleCount = {
  id: string;
  title: string;
  words: number;
};

type LiveItem = {
  id?: string;
  fieldData: Record<string, unknown>;
};

type ListItemsLiveResponse = {
  items?: LiveItem[];
  pagination?: {
    total?: number;
  };
};

export type WebflowClient = {
  collections: {
    items: {
      listItemsLive: (
        collectionId: string,
        options: { limit: number; offset: number }
      ) => Promise<ListItemsLiveResponse>;
    };
  };
};

export function countWords(html = '') {
  return html
    .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

export async function countCollectionWords(
  webflow: WebflowClient,
  collectionId: string,
  bodyField: string
) {
  const articles: WebflowArticleCount[] = [];
  let offset = 0;
  let total: number | undefined;
  let requests = 0;

  do {
    const page = await webflow.collections.items.listItemsLive(collectionId, {
      limit: 100,
      offset,
    });
    requests += 1;

    if (typeof page.pagination?.total !== 'number') {
      throw new Error('Webflow did not return a published-item total.');
    }

    total = page.pagination.total;
    const items = page.items ?? [];

    for (const item of items) {
      const body = item.fieldData[bodyField];
      const title = item.fieldData.name ?? item.fieldData.slug ?? item.id ?? 'Untitled';

      articles.push({
        id: item.id ?? 'unknown',
        title: typeof title === 'string' ? title : 'Untitled',
        words: countWords(typeof body === 'string' ? body : ''),
      });
    }

    offset += items.length;

    if (offset < total && items.length === 0) {
      throw new Error('Webflow pagination ended before all published items loaded.');
    }
  } while (offset < total!);

  return {
    articles,
    requests,
    total: articles.reduce((sum, article) => sum + article.words, 0),
  };
}

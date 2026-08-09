import { describe, expect, test } from 'bun:test';

import { countCollectionWords, countWords } from '../../src/webflow/word-count';

describe('countWords', () => {
  test.each([
    ['<p>Hello world</p>', 2],
    ['<h2>Title</h2><p>One two three.</p>', 4],
    ['<p>a<br>b</p>', 2],
    ['<p>tight<em>ish</em>word</p>', 3],
    ['<p>non&nbsp;breaking&nbsp;space</p>', 3],
    ['<p>R&amp;D spend</p>', 2],
    ['', 0],
    ['   <p>  </p>  ', 0],
    ["<p>keep</p><script>var x = 'drop';</script><p>this</p>", 2],
    ['<ul><li>one</li><li>two</li></ul>', 2],
  ])('counts %#', (html, expected) => {
    expect(countWords(html)).toBe(expected);
  });

  test('paginates published items past Webflow\'s 100-item limit', async () => {
    const calls: number[] = [];
    const items = Array.from({ length: 101 }, (_, index) => ({
      id: String(index),
      fieldData: { body: '<p>one</p>' },
    }));
    const webflow = {
      collections: {
        items: {
          listItemsLive: async (
            _collectionId: string,
            options: { limit: number; offset: number }
          ) => {
            calls.push(options.offset);
            return {
              items: items.slice(options.offset, options.offset + options.limit),
              pagination: { total: items.length },
            };
          },
        },
      },
    };

    const result = await countCollectionWords(webflow, 'collection-id', 'body');

    expect(calls).toEqual([0, 100]);
    expect(result.requests).toBe(2);
    expect(result.articles).toHaveLength(101);
    expect(result.total).toBe(101);
  });
});

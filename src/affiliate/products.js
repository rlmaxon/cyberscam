import config from '../config.json';
import { hasClickTracking } from '../amplifyConfig.js';

// Security Toolbox products live in src/config.json. Each product has a plain `url` and an
// `affiliateUrl`. Paste a program's tracking link into affiliateUrl once you're approved;
// until then the plain url is used. See docs/affiliate-setup.md.

export const categories = config.products;

export const productHref = (item) => item.affiliateUrl?.trim() || item.url;

// Products recommended at the end of a lesson (config: category.recommendFor)
export const categoriesForModule = (moduleKey) =>
  categories.filter((c) => (c.recommendFor ?? []).includes(moduleKey));

// Count a click on a product link: which product and which page, nothing about the person.
// Fire-and-forget: the link opens in a new tab whether or not this succeeds.
let client;
export function trackClick(productId, page) {
  if (!hasClickTracking) return;
  client ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'apiKey' }));
  client
    .then((api) => api.mutations.recordAffiliateClick({ product: productId, page }))
    .catch(() => {});
}

// ---- Admin ----

let adminClient;
const adminApi = () =>
  (adminClient ??= import('aws-amplify/data').then(({ generateClient }) => generateClient({ authMode: 'userPool' })));

const productNames = Object.fromEntries(categories.flatMap((c) => c.items.map((i) => [i.id, i.name])));
export const productName = (id) => productNames[id] ?? id;

export function pageLabel(page) {
  if (page === 'toolbox') return 'Security Toolbox';
  if (page?.startsWith('lesson-')) return `End of lesson: ${page.slice(7)}`;
  return page;
}

// Clicks per product over the last `days` days, with a breakdown by page.
export async function clickStats(days = 30) {
  const { listAll } = await import('../member/listAll.js');
  const api = await adminApi();
  const since = new Date(Date.now() - (days - 1) * 86400000).toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
  const rows = await listAll(api.models.AffiliateClickDaily, {
    filter: { day: { ge: since } },
    selectionSet: ['id', 'day', 'product', 'page', 'clicks'],
  });
  const byProduct = {};
  for (const r of rows) {
    const p = (byProduct[r.product] ??= { product: r.product, name: productName(r.product), clicks: 0, pages: {} });
    p.clicks += r.clicks ?? 0;
    p.pages[r.page] = (p.pages[r.page] ?? 0) + (r.clicks ?? 0);
  }
  return {
    since,
    total: rows.reduce((n, r) => n + (r.clicks ?? 0), 0),
    products: Object.values(byProduct).sort((a, b) => b.clicks - a.clicks),
  };
}

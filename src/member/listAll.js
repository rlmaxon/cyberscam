// AppSync list queries scan the table and THEN keep only the member's own records, and
// `limit` counts records scanned, not records returned. So `list({ limit: 1 })` can come
// back empty even when the member has a record, once the table holds other members' data.
// These helpers follow `nextToken` until they have what they need.

const PAGE = 1000;
const MAX_PAGES = 50;

// Every record the member can see.
export async function listAll(model, options = {}) {
  const items = [];
  let nextToken = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await model.list({ limit: PAGE, ...options, nextToken });
    if (res.errors?.length) throw new Error(res.errors[0].message);
    items.push(...(res.data ?? []).filter(Boolean));
    nextToken = res.nextToken;
    if (!nextToken) break;
  }
  return items;
}

// The first record the member can see, or null.
export async function findFirst(model, options = {}) {
  let nextToken = null;
  for (let page = 0; page < MAX_PAGES; page++) {
    const res = await model.list({ limit: PAGE, ...options, nextToken });
    if (res.errors?.length) throw new Error(res.errors[0].message);
    const found = (res.data ?? []).find(Boolean);
    if (found) return found;
    nextToken = res.nextToken;
    if (!nextToken) break;
  }
  return null;
}

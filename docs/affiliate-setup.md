# Affiliate Links: How to Add Them

The Security Toolbox and the "Optional: tools that can help" boxes at the end of some
lessons link to security products. Once you're approved for a company's affiliate
program, paste your tracking link into the site and commissions start counting.
**No AWS steps are needed.**

## 1. Add a tracking link

Products are in `src/config.json`, under `products`. Each one looks like this:

```json
{
  "id": "norton-360",
  "name": "Norton 360",
  "url": "https://norton.com",
  "affiliateUrl": ""
}
```

- Paste the program's tracking link into `affiliateUrl`, between the quotes.
- Leave `url` as it is. It's used whenever `affiliateUrl` is empty.
- **Don't change `id`.** Click counts are stored by id.
- Commit the change. The site updates on the next deploy.

You can do this in the GitHub website: open `src/config.json`, click the pencil icon,
edit, and commit to a new branch with a pull request.

## 2. Adding or removing products

- **New product:** copy an existing item and give it a new `id`, using lowercase letters,
  numbers and dashes only (like `"aura"`). Click counting ignores ids in any other format.
- **Which lessons show a category:** each category has `"recommendFor"`, a list of lesson
  keys (`email`, `text`, `phone`, `popup`, `government`, `marketplace`, `romance`,
  `investment`, `mindset`). An empty list `[]` means the category only appears in the
  Security Toolbox.
- **`why`:** one plain sentence about how the category helps, shown in the Toolbox and in
  the lesson boxes.

Product boxes are never shown inside a lesson or a test, only after the Quick Check is
passed.

## 3. Disclosure rules (already handled)

The FTC requires a clear disclosure near affiliate links. The site already has:

- a short note next to every set of product links, linking to the full page
- the full **Affiliate Disclosure** page at `/affiliate-disclosure` (footer link)
- `rel="sponsored noopener"` on every product link, which tells search engines these are
  paid links

**Amazon Associates:** Amazon requires the exact sentence "As an Amazon Associate, we earn
from qualifying purchases." Once you add any Amazon link, set `"amazonAssociate": true`
under `affiliate` in `src/config.json`, and the sentence appears on the disclosure page.
Also update `disclosureUpdated` to the date of the change.

Each program has its own rules, so read them when you're approved. Amazon's, for example,
limit showing prices (the Toolbox no longer shows any) and don't allow its links in
emails. The site's scam-alert and family emails never include product links.

## 4. See which links get clicked

**Site Admin → Product link clicks** shows clicks for the last 30 days, by product and by
page (the Toolbox, or the end of a specific lesson). Use it to decide which programs to
apply for first.

Only the product, the page, and the day are stored, with no information about who
clicked. Counts include anyone who taps a link, so treat them as a rough guide; the
affiliate program's own dashboard is the record of actual sales.

import React from 'react';
import { Link } from 'react-router-dom';
import { productHref, trackClick } from '../../affiliate/products.js';
import { PATHS } from '../../routes.js';

// A link to a product's website. Always opens in a new tab and is marked rel="sponsored"
// (affiliate links must be, and these are recommendations on a site funded by commissions).
// Each click is counted by product and page only.
export default function ProductLink({ item, page, className = '', children }) {
  return (
    <a
      href={productHref(item)}
      target="_blank"
      rel="sponsored noopener"
      onClick={() => trackClick(item.id, page)}
      className={className}
    >
      {children}
      <span className="sr-only"> (opens {item.name}'s website in a new tab)</span>
    </a>
  );
}

// The short disclosure shown next to product links, linking to the full page.
export function DisclosureNote({ className = '' }) {
  return (
    <p className={`text-base text-slate-600 ${className}`}>
      <strong>About these links:</strong> we may earn a small commission if you buy through them. It never changes the price you pay.{' '}
      <Link to={PATHS.affiliateDisclosure} className="text-blue-700 underline font-semibold">How this works</Link>
    </p>
  );
}

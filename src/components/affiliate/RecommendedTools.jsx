import React from 'react';
import { Link } from 'react-router-dom';
import { Wrench, ExternalLink } from 'lucide-react';
import { categoriesForModule } from '../../affiliate/products.js';
import { PATHS } from '../../routes.js';
import ProductLink, { DisclosureNote } from './ProductLink.jsx';

// Shown only after a lesson's Quick Check is passed, never inside a lesson or a test.
// Lessons with nothing relevant (config: products[].recommendFor) show nothing.
export default function RecommendedTools({ moduleKey }) {
  const cats = categoriesForModule(moduleKey);
  if (!cats.length) return null;
  return (
    <aside className="mt-8 bg-white rounded-2xl shadow border-2 border-slate-200 p-6" aria-labelledby="tools-heading">
      <h2 id="tools-heading" className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-3">
        <Wrench className="w-7 h-7 text-green-700" aria-hidden="true" /> Optional: tools that can help
      </h2>
      <p className="text-lg text-slate-700 mb-5">
        What you just learned is your best protection. If you'd like an extra layer, these kinds of tools help with this type of scam.
      </p>
      <div className="space-y-5">
        {cats.map((c) => (
          <div key={c.category}>
            <h3 className="text-xl font-bold text-slate-800">{c.category}</h3>
            <p className="text-lg text-slate-700 mb-3">{c.why}</p>
            <ul className="flex flex-wrap gap-3">
              {c.items.map((item) => (
                <li key={item.id}>
                  <ProductLink item={item} page={`lesson-${moduleKey}`} className="inline-flex items-center gap-2 min-h-[48px] px-4 py-2 rounded-xl border-2 border-slate-200 text-lg font-semibold text-slate-800 hover:border-blue-400">
                    {item.name} <ExternalLink className="w-4 h-4" aria-hidden="true" />
                  </ProductLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="text-lg mt-5">
        <Link to={PATHS.marketplace} className="text-blue-700 underline font-semibold">See the full Security Toolbox</Link>
      </p>
      <DisclosureNote className="mt-4" />
    </aside>
  );
}

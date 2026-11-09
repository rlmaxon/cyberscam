import React from 'react';
import { Link } from 'react-router-dom';
import { BadgeDollarSign } from 'lucide-react';
import config from '../config.json';
import { PATHS } from '../routes.js';

function formatDate(iso) {
  const [y, m, d] = (iso ?? '').split('-').map(Number);
  return y ? new Date(y, m - 1, d).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '';
}

// Plain-language affiliate disclosure (FTC Endorsement Guides). Linked from the footer and
// next to every product link.
export default function AffiliateDisclosurePage() {
  const updated = formatDate(config.affiliate?.disclosureUpdated);
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4">
      <article className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-10">
        <div className="w-16 h-16 rounded-2xl bg-green-100 text-green-700 flex items-center justify-center mb-5">
          <BadgeDollarSign className="w-9 h-9" aria-hidden="true" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2">Affiliate Disclosure</h1>
        {updated && <p className="text-lg text-slate-600 mb-8">Last updated {updated}</p>}

        <div className="space-y-6 text-lg text-slate-800 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold mb-2">The short version</h2>
            <p>
              {config.site.name} is free. To help pay for it, some links to products on our site are <strong>affiliate links</strong>.
              If you buy something after tapping one, the company may pay us a small commission.
            </p>
            <p className="mt-3"><strong>It never changes the price you pay.</strong></p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-2">Where you'll see them</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>The <Link to={PATHS.marketplace} className="text-blue-700 underline font-semibold">Security Toolbox</Link> page.</li>
              <li>The “Optional: tools that can help” box at the end of some lessons, after the Quick Check.</li>
            </ul>
            <p className="mt-3">You'll always see a note next to these links. Lessons, tests, Scam Alerts, and emergency help never include them.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-2">How we choose</h2>
            <p>
              We list kinds of tools that help with the scams we teach about, from well-known companies. A commission doesn't decide what we
              teach or what we recommend. No tool stops every scam, and you don't need to buy anything to stay safe: the habits in our free
              training are the best protection.
            </p>
          </section>

          {config.affiliate?.amazonAssociate && (
            <section>
              <h2 className="text-2xl font-bold mb-2">Amazon</h2>
              <p>As an Amazon Associate, we earn from qualifying purchases.</p>
            </section>
          )}

          <section>
            <h2 className="text-2xl font-bold mb-2">Your privacy</h2>
            <p>
              When you tap a product link, we count which product and which page it was on. We don't record who you are. The company's own
              website has its own privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-2">Questions?</h2>
            <p>
              Email us at <a href={`mailto:${config.contact.email}`} className="text-blue-700 underline font-semibold break-all">{config.contact.email}</a>.
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Eye, ExternalLink, ShoppingBag, Key, Trash2, Lightbulb } from 'lucide-react';
import { categories } from '../affiliate/products.js';
import { PATHS } from '../routes.js';
import ProductLink, { DisclosureNote } from '../components/affiliate/ProductLink.jsx';

const ICONS = {
  shield: Shield,
  eye: Eye,
  key: Key,
  trash2: Trash2,
};

const COLORS = {
  blue: 'from-blue-600 to-blue-700',
  purple: 'from-purple-600 to-violet-700',
  green: 'from-green-600 to-emerald-700',
  orange: 'from-orange-600 to-amber-700',
};

export default function AffiliateMarketplace() {
  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-2 mb-4">
            <ShoppingBag className="w-5 h-5 text-green-700" aria-hidden="true" />
            <span className="text-green-800 text-base font-semibold">Security Toolbox</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Your Security Toolbox</h1>
          <p className="text-xl text-slate-700 max-w-2xl mx-auto">
            Security products explained in plain language. They add extra layers of protection, but none of them stops every scam.
            The habits from our free training matter most.
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-10 p-5 bg-white border-2 border-slate-200 rounded-2xl">
          <DisclosureNote />
        </div>

        <div className="space-y-8">
          {categories.map((category) => {
            const Icon = ICONS[category.iconKey] ?? Shield;
            return (
              <section key={category.category} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden" aria-labelledby={`cat-${category.iconKey}`}>
                <div className={`bg-gradient-to-r ${COLORS[category.color] ?? COLORS.blue} p-6 text-white`}>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-8 h-8" aria-hidden="true" />
                    </div>
                    <div>
                      <h2 id={`cat-${category.iconKey}`} className="text-2xl font-bold">{category.category}</h2>
                      <p className="text-white/90 text-lg">“{category.tagline}”</p>
                    </div>
                  </div>
                  <p className="text-white text-lg">{category.description}</p>
                  {category.why && (
                    <p className="mt-3 flex items-start gap-2 text-lg text-white">
                      <Lightbulb className="w-6 h-6 flex-shrink-0" aria-hidden="true" /> {category.why}
                    </p>
                  )}
                </div>

                <div className="p-6 grid sm:grid-cols-3 gap-4">
                  {category.items.map((item) => (
                    <ProductLink
                      key={item.id}
                      item={item}
                      page="toolbox"
                      className="flex flex-col justify-between min-h-[120px] p-5 border-2 border-slate-200 rounded-xl hover:border-blue-400 hover:shadow-lg transition-all group"
                    >
                      <h3 className="text-xl font-bold text-slate-800 group-hover:text-blue-700 mb-3">{item.name}</h3>
                      <span className="flex items-center gap-2 text-lg font-semibold text-blue-700">
                        See plans and prices <ExternalLink className="w-5 h-5" aria-hidden="true" />
                      </span>
                    </ProductLink>
                  ))}
                </div>
              </section>
            );
          })}
        </div>

        <div className="mt-10 p-6 bg-slate-100 rounded-2xl text-lg text-slate-700 space-y-3">
          <p>
            <strong>Prices change often,</strong> so we don't list them here. Check the company's website before you buy, and watch for automatic renewals.
            Many offer a free trial or a money-back guarantee.
          </p>
          <p>
            <strong>Never buy security software from a pop-up or a phone call.</strong> Real companies don't call you to sell protection.{' '}
            <Link to={`${PATHS.learn}/popup`} className="text-blue-700 underline font-semibold">Learn how tech-support scams work</Link>
          </p>
          <DisclosureNote />
        </div>
      </div>
    </div>
  );
}

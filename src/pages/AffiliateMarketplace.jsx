import React from 'react';
import { Shield, Eye, ExternalLink, ShoppingBag, Star, Key, Trash2 } from 'lucide-react';
import config from '../config.json';

export default function AffiliateMarketplace() {
  const productIcons = {
    shield: <Shield className="w-8 h-8" />,
    eye: <Eye className="w-8 h-8" />,
    key: <Key className="w-8 h-8" />,
    trash2: <Trash2 className="w-8 h-8" />
  };

  const products = config.products;

  const colors = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-violet-600',
    green: 'from-green-500 to-emerald-600',
    orange: 'from-orange-500 to-amber-600'
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-green-100 border border-green-200 rounded-full px-4 py-2 mb-4">
            <ShoppingBag className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm font-medium">Security Toolbox</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Your Security Toolbox</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Recommended security products explained in plain language. These tools provide extra layers of protection for your digital life.
          </p>
        </div>

        <div className="space-y-8">
          {products.map((category, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
              {/* Category Header */}
              <div className={`bg-gradient-to-r ${colors[category.color]} p-6 text-white`}>
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                    {productIcons[category.iconKey]}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{category.category}</h2>
                    <p className="text-white/80 text-sm">"{category.tagline}"</p>
                  </div>
                </div>
                <p className="text-white/90">{category.description}</p>
              </div>

              {/* Products */}
              <div className="p-6 grid sm:grid-cols-3 gap-4">
                {category.items.map((item, itemIdx) => (
                  <a
                    key={itemIdx}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 border-2 border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all group"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-slate-800 group-hover:text-blue-600">{item.name}</h3>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm text-slate-600">{item.rating}</span>
                      </div>
                    </div>
                    <p className="text-blue-600 font-medium mb-3">{item.price}</p>
                    <div className="flex items-center gap-1 text-sm text-slate-500 group-hover:text-blue-500">
                      Learn More <ExternalLink className="w-4 h-4" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Affiliate Disclosure */}
        <div className="mt-8 p-4 bg-slate-100 rounded-xl text-center">
          <p className="text-sm text-slate-600">
            <strong>Affiliate Disclosure:</strong> We may earn a commission when you purchase through these links at no extra cost to you. 
            This helps support our educational mission.
          </p>
        </div>
      </div>
    </div>
  );
}

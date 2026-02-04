import React, { useState } from 'react';
import { Search, SlidersHorizontal, Grid3x3, List, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { Asset, AssetCategory } from '../../App';
import { StatusBadge } from '../common/StatusBadge';

interface CatalogViewProps {
  assets: Asset[];
  onViewAsset: (assetId: string) => void;
}

type ViewMode = 'grid' | 'list';

export function CatalogView({ assets, onViewAsset }: CatalogViewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'all'>('all');
  const [valueRange, setValueRange] = useState<'all' | 'under-100k' | '100k-500k' | 'over-500k'>('all');

  // Filter assets
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategory === 'all' || asset.category === selectedCategory;

    const matchesValue = 
      valueRange === 'all' ||
      (valueRange === 'under-100k' && asset.estimatedValue < 100000) ||
      (valueRange === '100k-500k' && asset.estimatedValue >= 100000 && asset.estimatedValue <= 500000) ||
      (valueRange === 'over-500k' && asset.estimatedValue > 500000);

    return matchesSearch && matchesCategory && matchesValue;
  });

  const totalValue = filteredAssets.reduce((sum, asset) => sum + asset.estimatedValue, 0);

  const categories: { value: AssetCategory | 'all'; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'vehicle', label: 'Vehicles' },
    { value: 'jewelry', label: 'Jewelry' },
    { value: 'watch', label: 'Watches' },
    { value: 'collectible', label: 'Collectibles' },
    { value: 'art', label: 'Art' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="min-h-screen pb-24 bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-slate-900">My Assets</h1>
              <p className="text-sm text-slate-600 mt-1">
                {filteredAssets.length} {filteredAssets.length === 1 ? 'item' : 'items'} · ${(totalValue / 1000).toFixed(0)}k total
              </p>
            </div>
            <div className="flex gap-1 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow-sm'
                    : 'text-slate-600'
                }`}
                aria-label="Grid view"
              >
                <Grid3x3 
                  className="w-5 h-5" 
                  style={{ color: viewMode === 'grid' ? '#009FB8' : undefined }}
                />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white shadow-sm'
                    : 'text-slate-600'
                }`}
                aria-label="List view"
              >
                <List 
                  className="w-5 h-5" 
                  style={{ color: viewMode === 'list' ? '#009FB8' : undefined }}
                />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
            />
          </div>

          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
            {(selectedCategory !== 'all' || valueRange !== 'all') && (
              <span className="px-2 py-0.5 bg-cyan-100 text-cyan-900 rounded-full text-xs">
                Active
              </span>
            )}
          </button>

          {/* Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs text-slate-600 mb-2">Category</label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        selectedCategory === cat.value
                          ? 'text-white'
                          : 'bg-neutral-100 text-slate-700 hover:bg-neutral-200'
                      }`}
                      style={{ backgroundColor: selectedCategory === cat.value ? '#009FB8' : undefined }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-600 mb-2">Value Range</label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'all', label: 'All' },
                    { value: 'under-100k', label: 'Under $100k' },
                    { value: '100k-500k', label: '$100k - $500k' },
                    { value: 'over-500k', label: 'Over $500k' },
                  ].map(range => (
                    <button
                      key={range.value}
                      onClick={() => setValueRange(range.value as any)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                        valueRange === range.value
                          ? 'text-white'
                          : 'bg-neutral-100 text-slate-700 hover:bg-neutral-200'
                      }`}
                      style={{ backgroundColor: valueRange === range.value ? '#009FB8' : undefined }}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Disclaimer banner */}
        <div className="px-4 py-3 bg-cyan-50 border-t border-cyan-100">
          <div className="flex gap-2 items-start">
            <AlertCircle className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-cyan-900">
              Assets shown here are not automatically insured. Check each item's insurance details below.
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {filteredAssets.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-neutral-400" />
            </div>
            <p className="text-slate-600 mb-2">No assets found</p>
            <p className="text-sm text-slate-500">
              {searchQuery || selectedCategory !== 'all' || valueRange !== 'all'
                ? 'Try adjusting your filters'
                : 'Add your first asset to get started'
              }
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredAssets.map(asset => (
              <motion.button
                key={asset.id}
                onClick={() => onViewAsset(asset.id)}
                className="text-left bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-cyan-500 transition-colors"
                whileTap={{ scale: 0.98 }}
              >
                <div className="aspect-square bg-neutral-100 relative">
                  {asset.photos[0] && (
                    <img
                      src={asset.photos.find(p => p.isCover)?.url || asset.photos[0].url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {asset.insurance && (
                    <div className="absolute top-2 right-2">
                      <StatusBadge status={asset.insurance.status} size="sm" />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm text-slate-900 mb-1 line-clamp-2">{asset.name}</h3>
                  <p className="text-xs text-slate-500 mb-2">{asset.category}</p>
                  <p className="text-sm text-slate-900">
                    ${asset.estimatedValue.toLocaleString()}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAssets.map(asset => (
              <motion.button
                key={asset.id}
                onClick={() => onViewAsset(asset.id)}
                className="w-full text-left bg-white rounded-xl overflow-hidden border border-neutral-200 hover:border-cyan-500 transition-colors p-4 flex gap-4"
                whileTap={{ scale: 0.99 }}
              >
                <div className="w-20 h-20 bg-neutral-100 rounded-lg flex-shrink-0 overflow-hidden">
                  {asset.photos[0] && (
                    <img
                      src={asset.photos.find(p => p.isCover)?.url || asset.photos[0].url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="text-sm text-slate-900 line-clamp-1">{asset.name}</h3>
                    {asset.insurance && (
                      <StatusBadge status={asset.insurance.status} size="sm" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2 line-clamp-1">
                    {asset.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-900">
                      ${asset.estimatedValue.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{asset.category}</p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
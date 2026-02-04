import React, { useState } from 'react';
import { ChevronLeft, Edit2, Trash2, Shield, Calendar, DollarSign, AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Asset } from '../../App';
import { StatusBadge } from '../common/StatusBadge';

interface AssetDetailProps {
  asset: Asset;
  onBack: () => void;
  onUpdate: (updates: Partial<Asset>) => void;
  onDelete: () => void;
}

export function AssetDetail({ asset, onBack, onUpdate, onDelete }: AssetDetailProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState(asset.name);
  const [editDescription, setEditDescription] = useState(asset.description);
  const [editValue, setEditValue] = useState(asset.estimatedValue.toString());
  const [editBrand, setEditBrand] = useState(asset.brand || '');

  const handleSaveEdit = () => {
    onUpdate({
      name: editName,
      description: editDescription,
      estimatedValue: parseFloat(editValue),
      brand: editBrand || undefined,
    });
    setIsEditing(false);
  };

  const handleDeleteConfirm = () => {
    onDelete();
  };

  const formattedDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen pb-24 bg-neutral-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="px-4 py-4 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
            Back
          </button>
          <div className="flex gap-2">
            {!isEditing && (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-neutral-100 rounded-lg"
                  aria-label="Edit asset"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                  aria-label="Delete asset"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {!isEditing ? (
        <div className="space-y-6">
          {/* Photo gallery */}
          {asset.photos.length > 0 && (
            <div className="relative bg-neutral-900">
              <img
                src={asset.photos[currentPhotoIndex].url}
                alt={asset.name}
                className="w-full h-80 object-cover"
              />
              {asset.photos.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                  {asset.photos.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPhotoIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                      }`}
                      aria-label={`View photo ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="px-4 space-y-6">
            {/* Client-provided information */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs text-slate-500 uppercase tracking-wide">Asset Information</h2>
                <span className="text-xs text-slate-500">Client-provided</span>
              </div>

              <div className="bg-white rounded-lg border border-neutral-200 p-4 space-y-4">
                <div>
                  <h1 className="text-slate-900 mb-1">{asset.name}</h1>
                  <p className="text-sm text-slate-600">{asset.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Estimated Value</span>
                    <p className="text-slate-900">${asset.estimatedValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Category</span>
                    <p className="text-slate-900 capitalize">{asset.category}</p>
                  </div>
                  {asset.brand && (
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Brand</span>
                      <p className="text-slate-900">{asset.brand}</p>
                    </div>
                  )}
                  {asset.year && (
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Year</span>
                      <p className="text-slate-900">{asset.year}</p>
                    </div>
                  )}
                  {asset.serialNumber && (
                    <div className="col-span-2">
                      <span className="block text-xs text-slate-500 mb-1">Serial Number</span>
                      <p className="text-slate-900 font-mono text-xs">{asset.serialNumber}</p>
                    </div>
                  )}
                  {asset.appraisalDate && (
                    <div>
                      <span className="block text-xs text-slate-500 mb-1">Appraisal Date</span>
                      <p className="text-slate-900">{formattedDate(asset.appraisalDate)}</p>
                    </div>
                  )}
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Added</span>
                    <p className="text-slate-900">{formattedDate(asset.createdAt)}</p>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 mb-1">Last Updated</span>
                    <p className="text-slate-900">{formattedDate(asset.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance information (read-only) */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs text-slate-500 uppercase tracking-wide">Insurance Details</h2>
                <span className="text-xs text-blue-600">From NFP</span>
              </div>

              {asset.insurance ? (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">Policy Status</span>
                    <StatusBadge status={asset.insurance.status} />
                  </div>

                  <div className="h-px bg-blue-200" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                        <DollarSign className="w-3 h-3" />
                        Annual Premium
                      </div>
                      <p className="text-slate-900">
                        ${asset.insurance.premium.toLocaleString()}/yr
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                        <Shield className="w-3 h-3" />
                        Coverage Limit
                      </div>
                      <p className="text-slate-900">
                        ${asset.insurance.coverageLimit.toLocaleString()}
                      </p>
                    </div>
                    {asset.insurance.deductible && (
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                          <AlertTriangle className="w-3 h-3" />
                          Deductible
                        </div>
                        <p className="text-slate-900">
                          ${asset.insurance.deductible.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {asset.insurance.effectiveDate && (
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                          <Calendar className="w-3 h-3" />
                          Effective Date
                        </div>
                        <p className="text-slate-900">
                          {formattedDate(asset.insurance.effectiveDate)}
                        </p>
                      </div>
                    )}
                    {asset.insurance.expirationDate && (
                      <div>
                        <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
                          <Calendar className="w-3 h-3" />
                          Expiration Date
                        </div>
                        <p className="text-slate-900">
                          {formattedDate(asset.insurance.expirationDate)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-blue-200">
                    <p className="text-xs text-slate-600">
                      Insurance details are managed by NFP and updated automatically. Contact your account manager for changes.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
                  <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-slate-500" />
                  </div>
                  <h3 className="text-sm text-slate-900 mb-1">No Insurance Details</h3>
                  <p className="text-xs text-slate-600">
                    Your NFP account manager will review this asset and update coverage information.
                  </p>
                </div>
              )}
            </div>

            {/* Important notice */}
            <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
              <p className="text-xs text-cyan-900">
                <strong>Important:</strong> Only information in the "Insurance Details" section represents active coverage. Asset information you provide is for cataloging purposes and does not guarantee coverage.
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Edit mode */
        <div className="px-4 py-6 space-y-6">
          <div>
            <h2 className="text-slate-900 mb-2">Edit Asset</h2>
            <p className="text-sm text-slate-600">
              Update your asset information. Insurance details cannot be edited here.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-slate-700 mb-2">Asset Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Estimated Value</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-700 mb-2">Brand</label>
              <input
                type="text"
                value={editBrand}
                onChange={(e) => setEditBrand(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-slate-900 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-3 text-white rounded-lg transition-colors"
              style={{ backgroundColor: '#009FB8' }}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-1 text-slate-400 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-slate-900 mb-2">Delete Asset?</h3>
              <p className="text-sm text-slate-600 mb-6">
                Are you sure you want to remove "{asset.name}" from your catalog? This action cannot be undone. Your account manager will be notified.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-slate-900 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
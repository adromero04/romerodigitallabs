import React, { useState } from 'react';
import { ChevronLeft, Camera, X, AlertCircle, CheckCircle, Info, Car, Gem, Watch, Image, Trophy, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Asset, AssetCategory } from '../../App';

interface AddAssetProps {
  onSave: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function AddAsset({ onSave, onCancel }: AddAssetProps) {
  const [step, setStep] = useState<'details' | 'photos' | 'confirm'>('details');
  const [showSuccess, setShowSuccess] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [estimatedValue, setEstimatedValue] = useState('');
  const [category, setCategory] = useState<AssetCategory>('other');
  const [brand, setBrand] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [year, setYear] = useState('');
  const [appraisalDate, setAppraisalDate] = useState('');
  const [photos, setPhotos] = useState<{ id: string; url: string; isCover: boolean }[]>([]);

  const categories = [
    { value: 'vehicle' as AssetCategory, label: 'Vehicle', icon: Car },
    { value: 'jewelry' as AssetCategory, label: 'Jewelry', icon: Gem },
    { value: 'watch' as AssetCategory, label: 'Watch', icon: Watch },
    { value: 'art' as AssetCategory, label: 'Art', icon: Image },
    { value: 'collectible' as AssetCategory, label: 'Collectible', icon: Trophy },
    { value: 'other' as AssetCategory, label: 'Other', icon: Package },
  ];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newPhoto = {
            id: Math.random().toString(36).substr(2, 9),
            url: event.target.result as string,
            isCover: photos.length === 0,
          };
          setPhotos(prev => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemovePhoto = (photoId: string) => {
    setPhotos(prev => {
      const filtered = prev.filter(p => p.id !== photoId);
      if (filtered.length > 0 && !filtered.some(p => p.isCover)) {
        filtered[0].isCover = true;
      }
      return filtered;
    });
  };

  const handleSetCover = (photoId: string) => {
    setPhotos(prev => prev.map(p => ({ ...p, isCover: p.id === photoId })));
  };

  const handleSubmit = () => {
    const asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'> = {
      name,
      description,
      estimatedValue: parseFloat(estimatedValue),
      category,
      brand: brand || undefined,
      serialNumber: serialNumber || undefined,
      year: year ? parseInt(year) : undefined,
      appraisalDate: appraisalDate || undefined,
      photos,
    };

    setShowSuccess(true);
    setTimeout(() => {
      onSave(asset);
    }, 1500);
  };

  const canProceedToPhotos = name && description && estimatedValue && category;
  const canSubmit = canProceedToPhotos && photos.length > 0;

  return (
    <div className="min-h-screen pb-24 bg-neutral-50 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200 px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <button
            onClick={onCancel}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900"
          >
            <ChevronLeft className="w-5 h-5" />
            Cancel
          </button>
          <h1 className="text-slate-900">Add Asset</h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        {/* Progress */}
        <div className="flex gap-2 mt-4">
          <div className={`flex-1 h-1 rounded-full ${step === 'details' || step === 'photos' || step === 'confirm' ? 'bg-cyan-500' : 'bg-neutral-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'photos' || step === 'confirm' ? 'bg-cyan-500' : 'bg-neutral-200'}`} />
          <div className={`flex-1 h-1 rounded-full ${step === 'confirm' ? 'bg-cyan-500' : 'bg-neutral-200'}`} />
        </div>
      </div>

      {/* Disclaimer banner */}
      <div className="px-4 py-3 bg-cyan-50 border-b border-cyan-100 flex-shrink-0">
        <div className="flex gap-2 items-start">
          <AlertCircle className="w-4 h-4 text-cyan-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-cyan-900">
            Adding an item to your catalog does not automatically provide insurance coverage. Your NFP account manager will review and contact you.
          </p>
        </div>
      </div>

      {/* Content - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-6 pb-8">
          <AnimatePresence mode="wait">
            {step === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Asset Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. 2023 Porsche 911 Turbo S"
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the asset, including key features or details"
                    rows={4}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Estimated Value <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={estimatedValue}
                      onChange={(e) => setEstimatedValue(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                    <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    We ask for estimated value to help your account manager determine appropriate coverage levels.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {categories.map(cat => {
                      const IconComponent = cat.icon;
                      const isSelected = category === cat.value;
                      return (
                        <button
                          key={cat.value}
                          type="button"
                          onClick={() => setCategory(cat.value)}
                          style={isSelected ? { backgroundColor: '#009FB8', borderColor: '#009FB8' } : {}}
                          className={`p-4 rounded-lg transition-all border ${
                            isSelected
                              ? ''
                              : 'bg-white border-neutral-200 hover:border-neutral-300'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-2">
                            <IconComponent className={`w-8 h-8 ${isSelected ? 'text-white' : 'text-slate-600'}`} />
                            <span className={`text-sm ${isSelected ? 'text-white' : 'text-slate-900'}`}>{cat.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Brand (optional)</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Rolex"
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-slate-700 mb-2">Year (optional)</label>
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      placeholder="2024"
                      className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">Serial Number (optional)</label>
                  <input
                    type="text"
                    value={serialNumber}
                    onChange={(e) => setSerialNumber(e.target.value)}
                    placeholder="e.g. SN123456789"
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                  <p className="text-xs text-slate-500 mt-2 flex items-start gap-1">
                    <Info className="w-3 h-3 flex-shrink-0 mt-0.5" />
                    Serial numbers help verify authenticity and ownership in case of loss or theft.
                  </p>
                </div>

                <div>
                  <label className="block text-sm text-slate-700 mb-2">Appraisal Date (optional)</label>
                  <input
                    type="date"
                    value={appraisalDate}
                    onChange={(e) => setAppraisalDate(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500"
                  />
                </div>

                <button
                  onClick={() => setStep('photos')}
                  disabled={!canProceedToPhotos}
                  className="w-full py-3 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: canProceedToPhotos ? '#009FB8' : '#d4d4d4'
                  }}
                >
                  Continue to Photos
                </button>
              </motion.div>
            )}

            {step === 'photos' && (
              <motion.div
                key="photos"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-slate-900 mb-2">Add Photos</h2>
                  <p className="text-sm text-slate-600">
                    Upload clear images of your asset. The first photo will be the cover image.
                  </p>
                </div>

                {/* Photo grid */}
                <div className="grid grid-cols-3 gap-3">
                  {photos.map(photo => (
                    <div key={photo.id} className="relative aspect-square">
                      <img
                        src={photo.url}
                        alt="Asset"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      {photo.isCover && (
                        <div className="absolute top-2 left-2 px-2 py-1 bg-cyan-600 text-white text-xs rounded">
                          Cover
                        </div>
                      )}
                      <div className="absolute top-2 right-2 flex gap-1">
                        {!photo.isCover && (
                          <button
                            onClick={() => handleSetCover(photo.id)}
                            className="p-1 bg-white/90 rounded hover:bg-white"
                            aria-label="Set as cover"
                          >
                            <CheckCircle className="w-4 h-4 text-slate-700" />
                          </button>
                        )}
                        <button
                          onClick={() => handleRemovePhoto(photo.id)}
                          className="p-1 bg-white/90 rounded hover:bg-white"
                          aria-label="Remove photo"
                        >
                          <X className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Upload button */}
                  <label className="aspect-square border-2 border-dashed border-neutral-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-cyan-50 transition-colors">
                    <Camera className="w-8 h-8 text-slate-400 mb-1" />
                    <span className="text-xs text-slate-600">Add Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('details')}
                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-slate-900 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    disabled={photos.length === 0}
                    className="flex-1 py-3 text-white rounded-lg transition-colors disabled:cursor-not-allowed"
                    style={{ 
                      backgroundColor: photos.length > 0 ? '#009FB8' : '#d4d4d4'
                    }}
                  >
                    Review
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'confirm' && (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-slate-900 mb-2">Review & Submit</h2>
                  <p className="text-sm text-slate-600">
                    Please review your asset details before submitting.
                  </p>
                </div>

                {/* Preview */}
                <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
                  {photos[0] && (
                    <img
                      src={photos.find(p => p.isCover)?.url || photos[0].url}
                      alt={name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="text-slate-900 mb-1">{name}</h3>
                      <p className="text-sm text-slate-600">{description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-slate-500">Value</span>
                        <p className="text-slate-900">${parseFloat(estimatedValue).toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Category</span>
                        <p className="text-slate-900 capitalize">{category}</p>
                      </div>
                      {brand && (
                        <div>
                          <span className="text-slate-500">Brand</span>
                          <p className="text-slate-900">{brand}</p>
                        </div>
                      )}
                      {year && (
                        <div>
                          <span className="text-slate-500">Year</span>
                          <p className="text-slate-900">{year}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Confirmation notice */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex gap-2 items-start mb-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-900">
                      What happens next?
                    </p>
                  </div>
                  <ul className="text-xs text-blue-800 space-y-1 ml-6 list-disc">
                    <li>Your asset will be added to your catalog</li>
                    <li>Your NFP account manager will be notified</li>
                    <li>They will review and contact you about coverage options</li>
                    <li>This item is NOT automatically insured until confirmed</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('photos')}
                    className="flex-1 py-3 bg-neutral-100 hover:bg-neutral-200 text-slate-900 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="flex-1 py-3 text-white rounded-lg transition-colors"
                    style={{ backgroundColor: '#009FB8' }}
                  >
                    Submit Asset
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Success modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl p-8 text-center max-w-sm"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-slate-900 mb-2">Asset Added Successfully</h3>
              <p className="text-sm text-slate-600">
                Your NFP account manager has been notified and will review your submission.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
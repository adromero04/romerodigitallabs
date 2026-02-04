import React, { useState, useEffect } from 'react';
import { Login } from './components/auth/Login';
import { MFA } from './components/auth/MFA';
import { Onboarding } from './components/onboarding/Onboarding';
import { CatalogView } from './components/catalog/CatalogView';
import { AddAsset } from './components/asset/AddAsset';
import { AssetDetail } from './components/asset/AssetDetail';
import { Settings } from './components/settings/Settings';
import { BottomNav } from './components/common/BottomNav';
import { SessionTimeout } from './components/common/SessionTimeout';

export type AppScreen = 
  | 'login' 
  | 'mfa' 
  | 'onboarding' 
  | 'catalog' 
  | 'add-asset' 
  | 'asset-detail' 
  | 'settings';

export type AssetCategory = 'vehicle' | 'jewelry' | 'collectible' | 'art' | 'watch' | 'other';
export type PolicyStatus = 'active' | 'pending' | 'not-bound' | 'needs-review';

export interface Asset {
  id: string;
  name: string;
  description: string;
  estimatedValue: number;
  category: AssetCategory;
  brand?: string;
  serialNumber?: string;
  year?: number;
  appraisalDate?: string;
  photos: { id: string; url: string; isCover: boolean }[];
  createdAt: string;
  updatedAt: string;
  // Insurance data (read-only, from NFP)
  insurance?: {
    premium: number;
    coverageLimit: number;
    deductible?: number;
    status: PolicyStatus;
    effectiveDate?: string;
    expirationDate?: string;
  };
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([
    // Sample data for demonstration
    {
      id: '1',
      name: '2023 Porsche 911 Turbo S',
      description: 'Guards Red with black leather interior, Sport Chrono package',
      estimatedValue: 285000,
      category: 'vehicle',
      brand: 'Porsche',
      year: 2023,
      photos: [
        { id: 'p1', url: 'https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800', isCover: true },
        { id: 'p2', url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800', isCover: false },
      ],
      createdAt: '2024-11-15T10:00:00Z',
      updatedAt: '2024-11-15T10:00:00Z',
      insurance: {
        premium: 4200,
        coverageLimit: 300000,
        deductible: 2500,
        status: 'active',
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31',
      },
    },
    {
      id: '2',
      name: 'Patek Philippe Nautilus 5711',
      description: 'Stainless steel with blue dial, full box and papers',
      estimatedValue: 175000,
      category: 'watch',
      brand: 'Patek Philippe',
      serialNumber: 'PP5711-1234',
      appraisalDate: '2024-09-15',
      photos: [
        { id: 'p3', url: 'https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800', isCover: true },
      ],
      createdAt: '2024-10-22T14:30:00Z',
      updatedAt: '2024-10-22T14:30:00Z',
      insurance: {
        premium: 2100,
        coverageLimit: 180000,
        status: 'active',
        effectiveDate: '2024-10-01',
        expirationDate: '2025-09-30',
      },
    },
    {
      id: '3',
      name: 'Vintage Ferrari Dino 246 GT',
      description: 'Rosso Corsa, matching numbers, recently restored',
      estimatedValue: 425000,
      category: 'vehicle',
      brand: 'Ferrari',
      year: 1972,
      appraisalDate: '2024-08-01',
      photos: [
        { id: 'p4', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800', isCover: true },
      ],
      createdAt: '2024-09-10T09:15:00Z',
      updatedAt: '2024-11-30T16:45:00Z',
      insurance: {
        premium: 6800,
        coverageLimit: 450000,
        deductible: 5000,
        status: 'active',
        effectiveDate: '2024-09-15',
        expirationDate: '2025-09-14',
      },
    },
    {
      id: '4',
      name: 'Diamond Tennis Bracelet',
      description: '15ct total weight, VVS clarity, platinum setting',
      estimatedValue: 95000,
      category: 'jewelry',
      appraisalDate: '2024-11-01',
      photos: [
        { id: 'p5', url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800', isCover: true },
      ],
      createdAt: '2024-12-01T11:20:00Z',
      updatedAt: '2024-12-01T11:20:00Z',
      insurance: {
        premium: 1200,
        coverageLimit: 100000,
        status: 'pending',
        effectiveDate: '2024-12-15',
      },
    },
  ]);

  // Session timeout simulation
  useEffect(() => {
    if (isAuthenticated) {
      const timeout = setTimeout(() => {
        setShowSessionTimeout(true);
      }, 15 * 60 * 1000); // 15 minutes
      return () => clearTimeout(timeout);
    }
  }, [isAuthenticated]);

  const handleLogin = () => {
    setCurrentScreen('mfa');
  };

  const handleMFASuccess = () => {
    setIsAuthenticated(true);
    if (!hasCompletedOnboarding) {
      setCurrentScreen('onboarding');
    } else {
      setCurrentScreen('catalog');
    }
  };

  const handleOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    setCurrentScreen('catalog');
  };

  const handleAddAsset = (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAsset: Asset = {
      ...asset,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setAssets([newAsset, ...assets]);
    setCurrentScreen('catalog');
    // In real app: trigger notification to account manager
  };

  const handleUpdateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets(assets.map(a => 
      a.id === id 
        ? { ...a, ...updates, updatedAt: new Date().toISOString() }
        : a
    ));
  };

  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter(a => a.id !== id));
    setCurrentScreen('catalog');
  };

  const handleViewAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setCurrentScreen('asset-detail');
  };

  const handleSessionTimeoutDismiss = () => {
    setShowSessionTimeout(false);
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentScreen('login');
  };

  const selectedAsset = selectedAssetId ? assets.find(a => a.id === selectedAssetId) : null;

  return (
    <div className="min-h-screen bg-neutral-50">
      {!isAuthenticated && currentScreen === 'login' && (
        <Login onLogin={handleLogin} />
      )}

      {!isAuthenticated && currentScreen === 'mfa' && (
        <MFA onSuccess={handleMFASuccess} onBack={() => setCurrentScreen('login')} />
      )}

      {isAuthenticated && currentScreen === 'onboarding' && (
        <Onboarding onComplete={handleOnboardingComplete} />
      )}

      {isAuthenticated && currentScreen === 'catalog' && (
        <>
          <CatalogView 
            assets={assets}
            onViewAsset={handleViewAsset}
          />
          <BottomNav 
            currentScreen="catalog" 
            onNavigate={setCurrentScreen}
          />
        </>
      )}

      {isAuthenticated && currentScreen === 'add-asset' && (
        <>
          <AddAsset 
            onSave={handleAddAsset}
            onCancel={() => setCurrentScreen('catalog')}
          />
          <BottomNav 
            currentScreen="add-asset" 
            onNavigate={setCurrentScreen}
          />
        </>
      )}

      {isAuthenticated && currentScreen === 'asset-detail' && selectedAsset && (
        <>
          <AssetDetail 
            asset={selectedAsset}
            onBack={() => setCurrentScreen('catalog')}
            onUpdate={(updates) => handleUpdateAsset(selectedAsset.id, updates)}
            onDelete={() => handleDeleteAsset(selectedAsset.id)}
          />
          <BottomNav 
            currentScreen="asset-detail" 
            onNavigate={setCurrentScreen}
          />
        </>
      )}

      {isAuthenticated && currentScreen === 'settings' && (
        <>
          <Settings onBack={() => setCurrentScreen('catalog')} onLogout={handleLogout} />
          <BottomNav 
            currentScreen="settings" 
            onNavigate={setCurrentScreen}
          />
        </>
      )}

      {showSessionTimeout && (
        <SessionTimeout onDismiss={handleSessionTimeoutDismiss} />
      )}
    </div>
  );
}

export default App;
'use client';
import { Suspense } from 'react';
import ProductsPage from '../products/page';

// Re-use products page reachable via search
export default function SearchPage() {
  return (
    <Suspense fallback={<div style={{ paddingTop: 120, textAlign: 'center' }}><div className="loader-gold" /></div>}>
      <ProductsPage />
    </Suspense>
  );
}

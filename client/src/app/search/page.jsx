'use client';
import { useSearchParams, Suspense } from 'next/navigation';
import ProductsPage from '../products/page';

// Re-use products page with search param active
export default function SearchPage() {
  return (
    <Suspense>
      <ProductsPage />
    </Suspense>
  );
}

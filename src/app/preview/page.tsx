import { Suspense } from 'react';
import PreviewPageClient from './PreviewPageClient';

export default function PreviewPage() {
  return (
    <Suspense fallback={null}>
      <PreviewPageClient />
    </Suspense>
  );
}

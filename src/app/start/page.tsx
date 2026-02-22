import { Suspense } from 'react';
import StartPageClient from './StartPageClient';

export default function StartPage() {
  return (
    <Suspense fallback={null}>
      <StartPageClient />
    </Suspense>
  );
}

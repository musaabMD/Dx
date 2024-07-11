
import Wall from '@/components/Wall';
import ExamsPage from '@/components/ExamsPage';
import { Suspense } from 'react';

export default function ProtectedExamsPage() {
  return (
    <Suspense>

    <Wall>
      <ExamsPage />
    </Wall>
    </Suspense>
  );
}


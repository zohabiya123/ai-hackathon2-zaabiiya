'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the todo page
    router.push('/todo');
  }, [router]);

  return null; // Render nothing since we're redirecting
}

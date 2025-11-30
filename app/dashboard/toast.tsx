'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

export function DashboardToast() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Show success toast
    toast.success('Login Successful');

    // Remove the query param to prevent toast on refresh
    const params = new URLSearchParams(searchParams.toString());
    params.delete('login');
    router.replace(`${pathname}?${params.toString()}`);
  }, [router, pathname, searchParams]);

  return null;
}

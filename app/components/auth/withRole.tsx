// app/components/auth/withRole.tsx
'use client';

import { useAuthContext } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '../ui/LoadingSpinner';

export function withRole<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles: string[]
) {
  const WithRoleWrapper = (props: P) => {
    const { user, isAuthenticated, isLoading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
      if (isLoading) return; // Wait until loading is finished

      if (!isAuthenticated) {
        router.replace('/auth/login');
      } else if (user && !allowedRoles.includes(user.role)) {
        // Redirect if the user's role is not in the allowed list
        router.replace('/'); // Or a dedicated '/unauthorized' page
      }
    }, [isLoading, isAuthenticated, user, router]);

    // While loading or if user is not authenticated or doesn't have the role, show a spinner
    if (isLoading || !isAuthenticated || (user && !allowedRoles.includes(user.role))) {
      return <LoadingSpinner />;
    }

    // If authenticated and role is correct, render the component
    return <WrappedComponent {...props} />;
  };

  WithRoleWrapper.displayName = `withRole(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithRoleWrapper;
}

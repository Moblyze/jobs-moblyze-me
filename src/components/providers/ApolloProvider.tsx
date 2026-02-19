'use client';

import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs';
import { makeApolloClient } from '@/lib/apollo-client';

interface ApolloProviderProps {
  children: React.ReactNode;
}

export function ApolloProvider({ children }: ApolloProviderProps) {
  return (
    <ApolloNextAppProvider makeClient={makeApolloClient}>
      {children}
    </ApolloNextAppProvider>
  );
}

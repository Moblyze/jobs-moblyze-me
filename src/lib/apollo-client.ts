import { HttpLink, ApolloLink } from '@apollo/client';
import {
  ApolloClient,
  InMemoryCache,
} from '@apollo/client-integration-nextjs';
import { createUploadLink } from 'apollo-upload-client';
import { getToken } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.moblyze.me/query';

/**
 * Server-side Apollo client (no auth).
 * Used in React Server Components (RSC) for public data fetching.
 */
export function getApolloClient(): ApolloClient {
  return new ApolloClient({
    link: new HttpLink({
      uri: API_URL,
      fetchOptions: { cache: 'no-store' },
    }),
    cache: new InMemoryCache(),
  });
}

/**
 * Client-side Apollo client factory (with auth).
 * Used in client components. Reads JWT from localStorage.
 * Supports file uploads via createUploadLink (for CV/resume upload).
 */
export function makeApolloClient(): ApolloClient {
  const authLink = new ApolloLink((operation, forward) => {
    const token = getToken();
    operation.setContext(({ headers = {} }: { headers: Record<string, string> }) => ({
      headers: {
        ...headers,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        appID: 'jobs-moblyze-me',
      },
    }));
    return forward(operation);
  });

  const uploadLink = createUploadLink({
    uri: API_URL,
  }) as unknown as ApolloLink;

  return new ApolloClient({
    link: ApolloLink.from([authLink, uploadLink]),
    cache: new InMemoryCache(),
  });
}

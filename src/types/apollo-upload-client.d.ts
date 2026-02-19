declare module 'apollo-upload-client' {
  import { ApolloLink } from '@apollo/client';

  export interface UploadLinkOptions {
    uri?: string;
    headers?: Record<string, string>;
    credentials?: string;
    fetchOptions?: RequestInit;
    fetch?: (input: RequestInfo, init?: RequestInit) => Promise<Response>;
    includeExtensions?: boolean;
    isExtractableFile?: (value: unknown) => boolean;
    formDataAppendFile?: (formData: FormData, index: string, file: unknown) => void;
  }

  export function createUploadLink(options?: UploadLinkOptions): ApolloLink;
  export function isExtractableFile(value: unknown): boolean;
}

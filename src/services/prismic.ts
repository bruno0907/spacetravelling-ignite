import Prismic from '@prismicio/client';
import { Document } from '@prismicio/client/types/documents';
import { DefaultClient } from '@prismicio/client/types/client';
import { ApiOptions } from '@prismicio/client/types/Api';

const accessToken = process.env.PRISMIC_ACCESS_TOKEN;
const url = process.env.PRISMIC_API_ENTRY_POINT;

export function getPrismicClient(req?: unknown): DefaultClient {
  const prismic = Prismic.client(url, {
    req,
    accessToken,
  });
  return prismic;
}

export function linkResolver(doc: Document): string {
  if (doc.type === 'posts') {
    return `/post/${doc.uid}`;
  }
  return '/';
}

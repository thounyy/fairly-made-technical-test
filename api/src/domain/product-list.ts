import { Product, PublishedVersion } from './product';

export type ProductListItem = {
  id: string;
  name: string;
  reference: string;
  lastChangedAt: string;
} & (
  | { publication: 'never-published' }
  | {
      publication: 'published';
      version: number;
      publishedAt: string;
      workingTreeChanged: boolean;
    }
);

export function toProductListItem(product: Product): ProductListItem {
  const latest = latestVersion(product.versions);
  const base = {
    id: product.id,
    name: product.name,
    reference: product.reference,
    lastChangedAt: product.lastChangedAt,
  };

  if (!latest) {
    return { ...base, publication: 'never-published' };
  }

  return {
    ...base,
    publication: 'published',
    version: latest.number,
    publishedAt: latest.publishedAt,
    workingTreeChanged: product.lastChangedAt > latest.publishedAt,
  };
}

function latestVersion(
  versions: PublishedVersion[],
): PublishedVersion | undefined {
  return versions.reduce<PublishedVersion | undefined>((latest, version) => {
    if (!latest || version.number > latest.number) {
      return version;
    }
    return latest;
  }, undefined);
}

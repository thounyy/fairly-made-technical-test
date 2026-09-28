import {
  ResolvedComponentItem,
  ResolvedItem,
  ResolvedMaterialItem,
  ResolvedProductItem,
  ResolvedStep,
} from '../domain/apply';
import {
  ComponentItem,
  Item,
  MaterialItem,
  ProductItem,
  Step,
} from '../domain/product';

export type NamedStep = ResolvedStep & {
  supplierName: string | null;
};

type NamedBase = {
  id: string;
  label: string;
  steps: NamedStep[];
  children: NamedItem[];
};

export type NamedItem =
  | (Omit<ResolvedProductItem, 'steps' | 'children'> & NamedBase)
  | (Omit<ResolvedComponentItem, 'steps' | 'children'> & NamedBase)
  | (Omit<ResolvedMaterialItem, 'steps' | 'children'> & NamedBase);

export function nameSuppliers(
  item: ResolvedItem,
  names: ReadonlyMap<string, string>,
): NamedItem {
  const steps = item.steps.map((step) => ({
    ...step,
    supplierName: supplierName(step.supplierId, names),
  }));
  const children = item.children.map((child) => nameSuppliers(child, names));
  return { ...item, steps, children };
}

export type FrozenStep = Step & { supplierName: string | null };

type FrozenBase = {
  id: string;
  label: string;
  steps: FrozenStep[];
  children: FrozenItem[];
};

export type FrozenItem =
  | (Omit<ProductItem, 'steps' | 'children'> & FrozenBase)
  | (Omit<ComponentItem, 'steps' | 'children'> & FrozenBase)
  | (Omit<MaterialItem, 'steps' | 'children'> & FrozenBase);

export function presentFrozen(
  item: Item,
  names: ReadonlyMap<string, string>,
): FrozenItem {
  const steps = item.steps.map((step) => ({
    ...step,
    supplierName: supplierName(step.supplierId, names),
  }));
  const children = item.children.map((child) => presentFrozen(child, names));
  return { ...item, steps, children };
}

function supplierName(
  supplierId: string | null,
  names: ReadonlyMap<string, string>,
): string | null {
  if (supplierId === null) {
    return null;
  }
  return names.get(supplierId) ?? null;
}

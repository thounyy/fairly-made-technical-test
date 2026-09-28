import {
  ResolvedComponentItem,
  ResolvedItem,
  ResolvedMaterialItem,
  ResolvedProductItem,
  ResolvedStep,
} from '../domain/apply';

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
    supplierName:
      step.supplierId === null ? null : (names.get(step.supplierId) ?? null),
  }));
  const children = item.children.map((child) => nameSuppliers(child, names));
  return { ...item, steps, children };
}

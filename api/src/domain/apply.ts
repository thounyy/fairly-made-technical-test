import { ComponentItem, Correction, Item, Product, Step } from './product';

export type Origin = 'declaration' | 'correction';

export type ResolvedStep = {
  id: string;
  process: string;
  supplierId: string | null;
  supplierOrigin: Origin;
  countryCode: string | null;
  countryOrigin: Origin;
  origin: Origin;
};

type ResolvedBase = {
  id: string;
  label: string;
  steps: ResolvedStep[];
  children: ResolvedItem[];
};

export type ResolvedProductItem = ResolvedBase & { kind: 'PRODUCT' };

export type ResolvedComponentItem = ResolvedBase & {
  kind: 'COMPONENT';
  usageCategory: string;
  usagePercentage: number;
  composition: {
    lines: ComponentItem['composition'];
    origin: Origin;
  };
};

export type ResolvedMaterialItem = ResolvedBase & {
  kind: 'MATERIAL';
  rawMaterial: string;
  originCountryCode: string | null;
};

export type ResolvedItem =
  ResolvedProductItem | ResolvedComponentItem | ResolvedMaterialItem;

export function apply(product: Product): ResolvedItem {
  return resolveItem(product.declaredTree, product.corrections);
}

function resolveItem(item: Item, corrections: Correction[]): ResolvedItem {
  const steps = item.steps.map((step) =>
    resolveDeclaredStep(step, corrections),
  );
  for (const correction of corrections) {
    if (correction.kind !== 'add-step' || correction.itemId !== item.id) {
      continue;
    }
    if (steps.some((step) => step.id === correction.step.id)) {
      continue;
    }
    steps.push(resolveAddedStep(correction.step, corrections));
  }

  const children = item.children.map((child) =>
    resolveItem(child, corrections),
  );
  const base = {
    id: item.id,
    label: item.label,
    steps,
    children,
  };

  if (item.kind === 'PRODUCT') {
    return { kind: 'PRODUCT', ...base };
  }
  if (item.kind === 'MATERIAL') {
    return {
      kind: 'MATERIAL',
      ...base,
      rawMaterial: item.rawMaterial,
      originCountryCode: item.originCountryCode,
    };
  }
  return {
    kind: 'COMPONENT',
    ...base,
    usageCategory: item.usageCategory,
    usagePercentage: item.usagePercentage,
    composition: resolveComposition(item, corrections),
  };
}

function resolveDeclaredStep(
  step: Step,
  corrections: Correction[],
): ResolvedStep {
  return withFieldCorrections(
    {
      id: step.id,
      process: step.process,
      supplierId: step.supplierId,
      supplierOrigin: 'declaration',
      countryCode: step.countryCode,
      countryOrigin: 'declaration',
      origin: 'declaration',
    },
    corrections,
  );
}

function resolveAddedStep(step: Step, corrections: Correction[]): ResolvedStep {
  return withFieldCorrections(
    {
      id: step.id,
      process: step.process,
      supplierId: step.supplierId,
      supplierOrigin: 'correction',
      countryCode: step.countryCode,
      countryOrigin: 'correction',
      origin: 'correction',
    },
    corrections,
  );
}

function withFieldCorrections(
  step: ResolvedStep,
  corrections: Correction[],
): ResolvedStep {
  let next = step;
  for (const correction of corrections) {
    if (correction.kind !== 'set-field' || correction.stepId !== step.id) {
      continue;
    }
    if (correction.field === 'supplierId') {
      next = {
        ...next,
        supplierId: correction.value,
        supplierOrigin: 'correction',
      };
    } else {
      next = {
        ...next,
        countryCode: correction.value,
        countryOrigin: 'correction',
      };
    }
  }
  return next;
}

function resolveComposition(
  item: ComponentItem,
  corrections: Correction[],
): ResolvedComponentItem['composition'] {
  const correction = corrections.find(
    (entry) =>
      entry.kind === 'set-composition' && entry.componentId === item.id,
  );
  if (!correction || correction.kind !== 'set-composition') {
    return { lines: item.composition, origin: 'declaration' };
  }
  return { lines: correction.composition, origin: 'correction' };
}

export function findResolvedStep(
  item: ResolvedItem,
  stepId: string,
): ResolvedStep | undefined {
  const found = item.steps.find((step) => step.id === stepId);
  if (found) {
    return found;
  }
  for (const child of item.children) {
    const nested = findResolvedStep(child, stepId);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

export function findResolvedComponent(
  item: ResolvedItem,
  componentId: string,
): ResolvedComponentItem | undefined {
  if (item.kind === 'COMPONENT' && item.id === componentId) {
    return item;
  }
  for (const child of item.children) {
    const nested = findResolvedComponent(child, componentId);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

export function findResolvedItem(
  item: ResolvedItem,
  itemId: string,
): ResolvedItem | undefined {
  if (item.id === itemId) {
    return item;
  }
  for (const child of item.children) {
    const nested = findResolvedItem(child, itemId);
    if (nested) {
      return nested;
    }
  }
  return undefined;
}

export function treesMatch(left: ResolvedItem, right: ResolvedItem): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

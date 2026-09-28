import {
  apply,
  findResolvedComponent,
  findResolvedItem,
  findResolvedStep,
  treesMatch,
} from './apply';
import {
  CompositionLine,
  Correction,
  DomainError,
  Product,
  SetFieldCorrection,
} from './product';

const countryCodePattern = /^[A-Z]{2}$/;

export function setSupplier(
  product: Product,
  stepId: string,
  supplierId: string | null,
  knownSupplierIds: ReadonlySet<string>,
): Product {
  assertStep(product, stepId);
  if (supplierId !== null && !knownSupplierIds.has(supplierId)) {
    throw new DomainError('UNKNOWN_SUPPLIER', 'Unknown supplier.');
  }
  return replaceField(product, {
    kind: 'set-field',
    stepId,
    field: 'supplierId',
    value: supplierId,
  });
}

export function setCountry(
  product: Product,
  stepId: string,
  countryCode: string | null,
): Product {
  assertStep(product, stepId);
  if (countryCode !== null && !countryCodePattern.test(countryCode)) {
    throw new DomainError(
      'INVALID_COUNTRY',
      'Country must be a 2-letter code, or empty when unknown.',
    );
  }
  return replaceField(product, {
    kind: 'set-field',
    stepId,
    field: 'countryCode',
    value: countryCode,
  });
}

export function addStep(
  product: Product,
  itemId: string,
  draft: {
    process: string;
    supplierId: string | null;
    countryCode: string | null;
  },
  knownProcessCodes: ReadonlySet<string>,
  knownSupplierIds: ReadonlySet<string>,
): Product {
  if (!findResolvedItem(apply(product), itemId)) {
    throw new DomainError('ITEM_NOT_FOUND', 'Item was not found.');
  }
  if (!knownProcessCodes.has(draft.process)) {
    throw new DomainError('UNKNOWN_PROCESS', 'Unknown process.');
  }
  if (draft.supplierId !== null && !knownSupplierIds.has(draft.supplierId)) {
    throw new DomainError('UNKNOWN_SUPPLIER', 'Unknown supplier.');
  }
  if (
    draft.countryCode !== null &&
    !countryCodePattern.test(draft.countryCode)
  ) {
    throw new DomainError(
      'INVALID_COUNTRY',
      'Country must be a 2-letter code, or empty when unknown.',
    );
  }

  return store(product, [
    ...product.corrections,
    {
      kind: 'add-step',
      itemId,
      step: {
        id: `stp_${crypto.randomUUID()}`,
        process: draft.process,
        supplierId: draft.supplierId,
        countryCode: draft.countryCode,
      },
    },
  ]);
}

export function setComposition(
  product: Product,
  componentId: string,
  percentages: { id: string; percentage: number }[],
): Product {
  const component = findResolvedComponent(apply(product), componentId);
  if (!component) {
    throw new DomainError('COMPONENT_NOT_FOUND', 'Component was not found.');
  }

  const current = component.composition.lines;
  const sameLines =
    percentages.length === current.length &&
    current.every((line) => percentages.some((entry) => entry.id === line.id));
  if (!sameLines) {
    throw new DomainError(
      'COMPOSITION_INVALID',
      'Composition lines do not match this component.',
    );
  }

  const composition: CompositionLine[] = current.map((line) => {
    const update = percentages.find((entry) => entry.id === line.id);
    if (!update || !Number.isFinite(update.percentage)) {
      throw new DomainError(
        'COMPOSITION_INVALID',
        'Composition percentages must sum to 100.',
      );
    }
    return { ...line, percentage: update.percentage };
  });
  const sum = composition.reduce((total, line) => total + line.percentage, 0);
  if (sum !== 100) {
    throw new DomainError(
      'COMPOSITION_INVALID',
      'Composition percentages must sum to 100.',
    );
  }

  const correction: Correction = {
    kind: 'set-composition',
    componentId,
    composition,
  };
  const without = product.corrections.filter(
    (entry) =>
      entry.kind !== 'set-composition' || entry.componentId !== componentId,
  );
  return store(product, [...without, correction]);
}

function assertStep(product: Product, stepId: string): void {
  if (!findResolvedStep(apply(product), stepId)) {
    throw new DomainError('STEP_NOT_FOUND', 'Step was not found.');
  }
}

function replaceField(
  product: Product,
  correction: SetFieldCorrection,
): Product {
  const without = product.corrections.filter(
    (entry) =>
      entry.kind !== 'set-field' ||
      entry.stepId !== correction.stepId ||
      entry.field !== correction.field,
  );
  return store(product, [...without, correction]);
}

function store(product: Product, corrections: Correction[]): Product {
  const next: Product = { ...product, corrections };
  if (treesMatch(apply(product), apply(next))) {
    return { ...next, lastChangedAt: product.lastChangedAt };
  }
  return { ...next, lastChangedAt: new Date().toISOString() };
}

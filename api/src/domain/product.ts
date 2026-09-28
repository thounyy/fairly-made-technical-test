export class DomainError extends Error {
  readonly code: string;

  constructor(code: string, message: string, cause?: unknown) {
    super(message, { cause });
    this.code = code;
    this.name = 'DomainError';
  }
}

export type Step = {
  id: string;
  process: string;
  supplierId: string | null;
  countryCode: string | null;
};

export type CompositionLine = {
  id: string;
  rawMaterial: string;
  percentage: number;
  originCountryCode: string | null;
};

type ItemBase = {
  id: string;
  label: string;
  steps: Step[];
  children: Item[];
};

export type ProductItem = ItemBase & {
  kind: 'PRODUCT';
};

export type ComponentItem = ItemBase & {
  kind: 'COMPONENT';
  usageCategory: string;
  usagePercentage: number;
  composition: CompositionLine[];
};

export type MaterialItem = ItemBase & {
  kind: 'MATERIAL';
  rawMaterial: string;
  originCountryCode: string | null;
};

export type Item = ProductItem | ComponentItem | MaterialItem;

export type SetFieldCorrection = {
  kind: 'set-field';
  stepId: string;
  field: 'supplierId' | 'countryCode';
  value: string | null;
};

export type AddStepCorrection = {
  kind: 'add-step';
  itemId: string;
  step: Step;
};

export type SetCompositionCorrection = {
  kind: 'set-composition';
  componentId: string;
  composition: CompositionLine[];
};

export type Correction =
  SetFieldCorrection | AddStepCorrection | SetCompositionCorrection;

export type PublishedVersion = {
  number: number;
  publishedAt: string;
  tree: Item;
};

export type Product = {
  id: string;
  name: string;
  reference: string;
  declaredTree: Item;
  corrections: Correction[];
  versions: PublishedVersion[];
  lastChangedAt: string;
};

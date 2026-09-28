import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { CompositionLine, DomainError, Item, Product, Step } from './product';

export function loadProducts(treesDirectory: string): Product[] {
  const fileNames = readdirSync(treesDirectory)
    .filter((name) => name.endsWith('.json'))
    .sort();

  return fileNames.map((fileName) => {
    const contents = readFileSync(join(treesDirectory, fileName), 'utf8');
    return parseTreeFile(contents, fileName);
  });
}

export function parseDeclaredTree(value: unknown): { id: string; root: Item } {
  const tree = expectRecord(value, 'tree');
  const product = expectRecord(tree.product, 'tree.product');
  return {
    id: readString(product.id, 'tree.product.id'),
    root: parseItem(tree.rootItem, 'tree.rootItem'),
  };
}

function parseTreeFile(contents: string, fileName: string): Product {
  const parsed: unknown = parseJson(contents, fileName);
  const tree = expectRecord(parsed, fileName);
  const product = expectRecord(tree.product, `${fileName}.product`);

  return {
    id: readString(product.id, `${fileName}.product.id`),
    name: readString(product.name, `${fileName}.product.name`),
    reference: readString(product.reference, `${fileName}.product.reference`),
    declaredTree: parseItem(tree.rootItem, `${fileName}.rootItem`),
    corrections: [],
    versions: [],
    lastChangedAt: readString(
      product.lastModifiedAt,
      `${fileName}.product.lastModifiedAt`,
    ),
  };
}

function parseItem(value: unknown, where: string): Item {
  const record = expectRecord(value, where);
  const kind = readString(record.kind, `${where}.kind`);
  const base = {
    id: readString(record.id, `${where}.id`),
    label: readString(record.label, `${where}.label`),
    steps: readArray(record.steps, `${where}.steps`).map((step, index) =>
      parseStep(step, `${where}.steps[${index}]`),
    ),
    children: readArray(record.children, `${where}.children`).map(
      (child, index) => parseItem(child, `${where}.children[${index}]`),
    ),
  };

  if (kind === 'PRODUCT') {
    return { kind, ...base };
  }
  if (kind === 'COMPONENT') {
    return {
      kind,
      ...base,
      usageCategory: readString(record.usageCategory, `${where}.usageCategory`),
      usagePercentage: readNumber(
        record.usagePercentage,
        `${where}.usagePercentage`,
      ),
      composition: readArray(record.composition, `${where}.composition`).map(
        (line, index) =>
          parseCompositionLine(line, `${where}.composition[${index}]`),
      ),
    };
  }
  if (kind === 'MATERIAL') {
    return {
      kind,
      ...base,
      rawMaterial: readString(record.rawMaterial, `${where}.rawMaterial`),
      originCountryCode: readNullableString(
        record.originCountryCode,
        `${where}.originCountryCode`,
      ),
    };
  }
  throw new DomainError(
    'INVALID_TREE',
    `${where}.kind is not a tree item kind`,
  );
}

function parseStep(value: unknown, where: string): Step {
  const record = expectRecord(value, where);
  return {
    id: readString(record.id, `${where}.id`),
    process: readString(record.process, `${where}.process`),
    supplierId: readNullableString(record.supplierId, `${where}.supplierId`),
    countryCode: readNullableString(record.countryCode, `${where}.countryCode`),
  };
}

function parseCompositionLine(value: unknown, where: string): CompositionLine {
  const record = expectRecord(value, where);
  return {
    id: readString(record.id, `${where}.id`),
    rawMaterial: readString(record.rawMaterial, `${where}.rawMaterial`),
    percentage: readNumber(record.percentage, `${where}.percentage`),
    originCountryCode: readNullableString(
      record.originCountryCode,
      `${where}.originCountryCode`,
    ),
  };
}

function parseJson(contents: string, fileName: string): unknown {
  try {
    return JSON.parse(contents) as unknown;
  } catch (cause) {
    throw new DomainError('INVALID_TREE', `${fileName} is not JSON`, cause);
  }
}

function expectRecord(value: unknown, where: string): Record<string, unknown> {
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  throw new DomainError('INVALID_TREE', `${where} must be an object`);
}

function readArray(value: unknown, where: string): unknown[] {
  if (Array.isArray(value)) {
    return value;
  }
  throw new DomainError('INVALID_TREE', `${where} must be an array`);
}

function readString(value: unknown, where: string): string {
  if (typeof value === 'string') {
    return value;
  }
  throw new DomainError('INVALID_TREE', `${where} must be a string`);
}

function readNullableString(value: unknown, where: string): string | null {
  if (value === null) {
    return null;
  }
  return readString(value, where);
}

function readNumber(value: unknown, where: string): number {
  if (typeof value === 'number') {
    return value;
  }
  throw new DomainError('INVALID_TREE', `${where} must be a number`);
}

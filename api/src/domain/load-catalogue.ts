import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DomainError } from './product';

export type Supplier = {
  id: string;
  name: string;
};

export type ProcessOption = {
  code: string;
  label: string;
};

export type Catalogue = {
  suppliers: Supplier[];
  processes: ProcessOption[];
};

export function loadCatalogue(dataDirectory: string): Catalogue {
  return {
    suppliers: parseSuppliers(
      readJson(join(dataDirectory, 'suppliers.json'), 'suppliers.json'),
    ),
    processes: parseProcesses(
      readJson(join(dataDirectory, 'processes.json'), 'processes.json'),
    ),
  };
}

function parseSuppliers(value: unknown): Supplier[] {
  const record = expectRecord(value, 'suppliers.json');
  return readArray(record.suppliers, 'suppliers.json.suppliers').map(
    (entry, index) => {
      const supplier = expectRecord(entry, `suppliers[${index}]`);
      return {
        id: readString(supplier.id, `suppliers[${index}].id`),
        name: readString(supplier.name, `suppliers[${index}].name`),
      };
    },
  );
}

function parseProcesses(value: unknown): ProcessOption[] {
  const record = expectRecord(value, 'processes.json');
  return readArray(record.processes, 'processes.json.processes').map(
    (entry, index) => {
      const process = expectRecord(entry, `processes[${index}]`);
      return {
        code: readString(process.code, `processes[${index}].code`),
        label: readString(process.label, `processes[${index}].label`),
      };
    },
  );
}

function readJson(path: string, fileName: string): unknown {
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as unknown;
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

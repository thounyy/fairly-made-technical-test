import { Injectable } from '@nestjs/common';
import { resolve } from 'node:path';
import { apply } from '../domain/apply';
import {
  addStep,
  setComposition,
  setCountry,
  setSupplier,
} from '../domain/edit-tree';
import { Catalogue, loadCatalogue } from '../domain/load-catalogue';
import { loadProducts } from '../domain/load-products';
import { DomainError, Product } from '../domain/product';
import { nameSuppliers, NamedItem } from './present-tree';

export type WorkingTree = {
  id: string;
  name: string;
  reference: string;
  lastChangedAt: string;
  root: NamedItem;
};

@Injectable()
export class TraceabilityService {
  private readonly products: Product[];
  private readonly catalogue: Catalogue;
  private readonly supplierIds: ReadonlySet<string>;
  private readonly processCodes: ReadonlySet<string>;
  private readonly supplierNames: ReadonlyMap<string, string>;

  constructor() {
    const dataDirectory = resolve(process.cwd(), '../data');
    this.products = loadProducts(resolve(dataDirectory, 'trees'));
    this.catalogue = loadCatalogue(dataDirectory);
    this.supplierIds = new Set(
      this.catalogue.suppliers.map((supplier) => supplier.id),
    );
    this.processCodes = new Set(
      this.catalogue.processes.map((process) => process.code),
    );
    this.supplierNames = new Map(
      this.catalogue.suppliers.map((supplier) => [supplier.id, supplier.name]),
    );
  }

  list(): readonly Product[] {
    return this.products;
  }

  suppliers(): Catalogue['suppliers'] {
    return this.catalogue.suppliers;
  }

  processes(): Catalogue['processes'] {
    return this.catalogue.processes;
  }

  workingTree(productId: string): WorkingTree {
    return this.present(this.product(productId));
  }

  changeSupplier(
    productId: string,
    stepId: string,
    supplierId: string | null,
  ): WorkingTree {
    return this.present(
      this.replace(productId, (product) =>
        setSupplier(product, stepId, supplierId, this.supplierIds),
      ),
    );
  }

  changeCountry(
    productId: string,
    stepId: string,
    countryCode: string | null,
  ): WorkingTree {
    return this.present(
      this.replace(productId, (product) =>
        setCountry(product, stepId, countryCode),
      ),
    );
  }

  addStep(
    productId: string,
    itemId: string,
    draft: {
      process: string;
      supplierId: string | null;
      countryCode: string | null;
    },
  ): WorkingTree {
    return this.present(
      this.replace(productId, (product) =>
        addStep(product, itemId, draft, this.processCodes, this.supplierIds),
      ),
    );
  }

  changeComposition(
    productId: string,
    componentId: string,
    lines: { id: string; percentage: number }[],
  ): WorkingTree {
    return this.present(
      this.replace(productId, (product) =>
        setComposition(product, componentId, lines),
      ),
    );
  }

  private product(productId: string): Product {
    const product = this.products.find((entry) => entry.id === productId);
    if (!product) {
      throw new DomainError('PRODUCT_NOT_FOUND', 'Product was not found.');
    }
    return product;
  }

  private replace(
    productId: string,
    change: (product: Product) => Product,
  ): Product {
    const index = this.products.findIndex((entry) => entry.id === productId);
    if (index < 0) {
      throw new DomainError('PRODUCT_NOT_FOUND', 'Product was not found.');
    }
    const next = change(this.products[index]);
    this.products[index] = next;
    return next;
  }

  private present(product: Product): WorkingTree {
    return {
      id: product.id,
      name: product.name,
      reference: product.reference,
      lastChangedAt: product.lastChangedAt,
      root: nameSuppliers(apply(product), this.supplierNames),
    };
  }
}

import { Injectable } from '@nestjs/common';
import { resolve } from 'node:path';
import { loadProducts } from '../domain/load-products';
import { Product } from '../domain/product';

@Injectable()
export class TraceabilityService {
  private readonly products: Product[];

  constructor() {
    this.products = loadProducts(resolve(process.cwd(), '../data/trees'));
  }

  list(): readonly Product[] {
    return this.products;
  }
}

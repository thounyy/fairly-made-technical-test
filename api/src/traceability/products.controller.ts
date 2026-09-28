import { Controller, Get } from '@nestjs/common';
import { toProductListItem, ProductListItem } from '../domain/product-list';
import { TraceabilityService } from './traceability.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly traceability: TraceabilityService) {}

  @Get()
  list(): ProductListItem[] {
    return this.traceability.list().map(toProductListItem);
  }
}

import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import type { ProcessOption, Supplier } from '../domain/load-catalogue';
import { toProductListItem } from '../domain/product-list';
import type { ProductListItem } from '../domain/product-list';
import { DomainError } from '../domain/product';
import type { WorkingTree } from './traceability.service';
import { TraceabilityService } from './traceability.service';

@Controller()
export class ProductsController {
  constructor(private readonly traceability: TraceabilityService) {}

  @Get('products')
  list(): ProductListItem[] {
    return this.traceability.list().map(toProductListItem);
  }

  @Get('products/:id/working-tree')
  workingTree(@Param('id') id: string): WorkingTree {
    return this.traceability.workingTree(id);
  }

  @Post('products/:id/steps/:stepId/supplier')
  changeSupplier(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() body: unknown,
  ): WorkingTree {
    return this.traceability.changeSupplier(
      id,
      stepId,
      readNullableString(body, 'supplierId'),
    );
  }

  @Post('products/:id/steps/:stepId/country')
  changeCountry(
    @Param('id') id: string,
    @Param('stepId') stepId: string,
    @Body() body: unknown,
  ): WorkingTree {
    return this.traceability.changeCountry(
      id,
      stepId,
      readNullableString(body, 'countryCode'),
    );
  }

  @Post('products/:id/items/:itemId/steps')
  addStep(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() body: unknown,
  ): WorkingTree {
    const record = expectBody(body);
    return this.traceability.addStep(id, itemId, {
      process: readString(record, 'process'),
      supplierId: readNullableString(record, 'supplierId'),
      countryCode: readNullableString(record, 'countryCode'),
    });
  }

  @Post('products/:id/components/:componentId/composition')
  changeComposition(
    @Param('id') id: string,
    @Param('componentId') componentId: string,
    @Body() body: unknown,
  ): WorkingTree {
    return this.traceability.changeComposition(
      id,
      componentId,
      readPercentages(body),
    );
  }

  @Get('suppliers')
  suppliers(): Supplier[] {
    return this.traceability.suppliers();
  }

  @Get('processes')
  processes(): ProcessOption[] {
    return this.traceability.processes();
  }
}

function expectBody(body: unknown): Record<string, unknown> {
  if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
    return body as Record<string, unknown>;
  }
  throw new DomainError('INVALID_BODY', 'Request body must be an object.');
}

function readString(body: unknown, key: string): string {
  const value = expectBody(body)[key];
  if (typeof value !== 'string' || value === '') {
    throw new DomainError('INVALID_BODY', `${key} must be a string.`);
  }
  return value;
}

function readNullableString(body: unknown, key: string): string | null {
  const value = expectBody(body)[key];
  if (value === null || value === '') {
    return null;
  }
  if (typeof value === 'string') {
    return value;
  }
  throw new DomainError('INVALID_BODY', `${key} must be a string or null.`);
}

function readPercentages(body: unknown): { id: string; percentage: number }[] {
  const lines = expectBody(body).lines;
  if (!Array.isArray(lines)) {
    throw new DomainError('INVALID_BODY', 'lines must be an array.');
  }
  return lines.map((line, index) => {
    const record = expectBody(line);
    const percentage = record.percentage;
    if (typeof percentage !== 'number') {
      throw new DomainError(
        'INVALID_BODY',
        `lines[${index}].percentage must be a number.`,
      );
    }
    return {
      id: readString(record, 'id'),
      percentage,
    };
  });
}

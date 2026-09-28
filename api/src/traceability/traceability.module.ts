import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { TraceabilityService } from './traceability.service';

@Module({
  controllers: [ProductsController],
  providers: [TraceabilityService],
  exports: [TraceabilityService],
})
export class TraceabilityModule {}

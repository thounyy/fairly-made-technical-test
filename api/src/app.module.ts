import { Module } from '@nestjs/common';
import { TraceabilityModule } from './traceability/traceability.module';

@Module({
  imports: [TraceabilityModule],
})
export class AppModule {}

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DomainErrorFilter } from './traceability/domain-error.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new DomainErrorFilter());
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();

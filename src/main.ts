import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    },
  });

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 4444;

  console.log('DATABASE_URL:', process.env.DATABASE_URL);

  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
}
void bootstrap();

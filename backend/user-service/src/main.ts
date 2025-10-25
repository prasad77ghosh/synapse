import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.GRPC,
      options: {
        package: 'user',
        protoPath: join(__dirname, '../../../proto/user.proto'),
        url: `0.0.0.0:${process.env.PORT || 3000}`,
      },
    },
  );

  await app.listen();
  console.log(`User Service gRPC server running on ${process.env.PORT}`);
}
bootstrap();

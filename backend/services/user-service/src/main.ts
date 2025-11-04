import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';

// main.ts (HTTP + gRPC hybrid)
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // HTTP REST gateway for Kong
  await app.listen(3002, '0.0.0.0');
  console.log('User HTTP gateway running on 3002');

  // gRPC microservice
  const grpcApp = app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'user',
      protoPath: join(__dirname, '../../../../proto/user.proto'),
      url: `0.0.0.0:${process.env.GRPC_PORT || 50052}`,
    },
  });

  await grpcApp.listen();
  console.log('User gRPC server running');
}
bootstrap();

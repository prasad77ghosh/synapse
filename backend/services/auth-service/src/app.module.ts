import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { KafkaService } from './kafka/kafka.service';
import { KafkaModule } from './kafka/kafka.module';
import { RedisService } from './redis/redis.service';
import { RedisModule } from './redis/redis.module';
import { JwtModule } from '@nestjs/jwt';
import { KongService } from './kong/kong.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ClientsModule.register([
      {
        name: 'USER_SERVICE',
        transport: Transport.GRPC,
        options: {
          package: 'user',
          protoPath: join(__dirname, '../../../proto/user.proto'),
          url: 'localhost:50052',
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'supersecret',
      signOptions: { expiresIn: '15m' },
    }),
    KafkaModule,
    RedisModule,
    HttpModule,
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService, KafkaService, RedisService, KongService],
})
export class AppModule {}

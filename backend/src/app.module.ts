import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AppwriteModule } from './appwrite/appwrite.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  controllers: [AppController, UsersController],
  providers: [AppService, UsersService],
  imports: [UsersModule, JwtModule, AppwriteModule, ConfigModule.forRoot()],
})
export class AppModule {}

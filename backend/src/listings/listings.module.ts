import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppwriteService } from 'src/appwrite/appwrite.service';
import { AppwriteModule } from 'src/appwrite/appwrite.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  providers: [ListingsService],
  controllers: [ListingsController],
  imports: [AppwriteModule, ConfigModule, JwtModule],
})
export class ListingsModule {}

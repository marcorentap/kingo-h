import { Module } from '@nestjs/common';
import { AppwriteService } from './appwrite.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  providers: [AppwriteService],
  imports: [ConfigModule],
  exports: [AppwriteService],
})
export class AppwriteModule {}

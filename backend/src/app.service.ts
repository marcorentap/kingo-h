import { Injectable, UseGuards } from '@nestjs/common';
import { TokenGuard } from './token-guard/token-guard.guard';

@Injectable()
@UseGuards(TokenGuard)
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }
}

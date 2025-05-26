import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtModule, JwtService } from '@nestjs/jwt';

@Injectable()
export class TokenGuard implements CanActivate {
  constructor(readonly jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      return false;
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid token format');
    }

    let tokenJson = this.jwtService.decode(token);
    request.token = token;
    request.userId = tokenJson['userId'];
    request.sessionId = tokenJson['sessionId'];
    request.tokenExp = tokenJson['exp'];
    return true;
  }
}

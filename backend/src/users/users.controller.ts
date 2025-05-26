import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { TokenGuard } from 'src/token-guard/token-guard.guard';
import { UsersService } from './users.service';
import { DBUserDto } from 'src/appwrite/db-user.dto';

@UseGuards(TokenGuard)
@Controller('users')
export class UsersController {
  constructor(readonly usersService: UsersService) {}
  @Get('/me')
  GetMe(@Req() req: Request) {
    return this.usersService.getUser(req['userId']);
  }

  @Post('')
  @UseGuards(TokenGuard)
  CreateUser(@Req() req: Request, @Body() form: DBUserDto) {
    return this.usersService.createUser(req['userId'], form);
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { TokenGuard } from 'src/token-guard/token-guard.guard';
import { UsersService } from './users.service';
import { DBUserDto } from 'src/appwrite/db-user.dto';

@UseGuards(TokenGuard)
@Controller('users')
export class UsersController {
  constructor(readonly usersService: UsersService) {}

  @UseGuards(TokenGuard)
  @Get('/me')
  GetMe(@Req() req: Request) {
    return this.usersService.getUser(req['userId']);
  }

  @UseGuards(TokenGuard)
  @Get('/me/ratings')
  GetMeRatings(@Req() req: Request) {
    return this.usersService.getUserRatings(req['userId']);
  }

  @Get(':id/ratings')
  @UseGuards(TokenGuard)
  GetUserRatings(@Req() req: Request, @Param('id') id: string) {
    return this.usersService.getUserRatings(id);
  }

  @Get(':id')
  @UseGuards(TokenGuard)
  GetUser(@Req() req: Request, @Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Post('')
  @UseGuards(TokenGuard)
  CreateUser(@Req() req: Request, @Body() form: DBUserDto) {
    return this.usersService.createUser(req['userId'], form);
  }
}

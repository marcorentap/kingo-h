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
import { CommentsService } from './comments.service';

@Controller('comments')
export class CommentsController {
  constructor(readonly commentsService: CommentsService) {}

  @Get('/:id')
  @UseGuards(TokenGuard)
  async GetComment(@Req() req: Request, @Param('id') id: string) {
    const comment = await this.commentsService.getComment(id);
    return comment;
  }
}

import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CreateListingDto } from './create-listing.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ListingsService } from './listings.service';
import { TokenGuard } from 'src/token-guard/token-guard.guard';
import { SelectFreelancerDto } from './select-freelancer.dto';
import { MarkListingCompleteDto } from './mark-listing-complete.dto';
import { ApproveCompletionDto } from './approve-completion.dto';
import { CreateCommentDto } from './create-comment.dto';
import { CreateChatDto } from './create-chat.dto';
const { InputFile } = require('node-appwrite/file');

@Controller('listings')
@UseGuards(TokenGuard)
export class ListingsController {
  constructor(readonly listingService: ListingsService) {}

  @UseGuards(TokenGuard)
  @Post('')
  @UseInterceptors(FilesInterceptor('files'))
  CreateListing(
    @Req() req: Request,
    @Body() form: CreateListingDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.listingService.createListing(
      req['userId'],
      form.title,
      form.description,
      Number(form.longitude),
      Number(form.latitude),
      Number(form.payment),
      form.category,
      files,
    );
  }
  @UseGuards(TokenGuard)
  @Post('/:id/complete')
  @UseInterceptors(FilesInterceptor('files'))
  MarkListingComplete(
    @Req() req: Request,
    @Body() form: MarkListingCompleteDto,
    @Param('id') id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.listingService.markListingComplete(req['userId'], id, files);
  }

  @Get('')
  @UseGuards(TokenGuard)
  async GetListings(
    @Req() req: Request,
    @Query('search') search: string,
    @Query('category') category: string,
    @Query('maxDistance') maxDistance: number,
    @Query('status') status: string,
  ) {
    const listings = await this.listingService.getListings(
      search,
      category,
      Number(maxDistance),
      status,
    );
    return listings;
  }

  @Get('me')
  @UseGuards(TokenGuard)
  async GetMyListings(@Req() req: Request) {
    const listings = await this.listingService.getUserListings(req['userId']);
    return listings;
  }

  @Get('/:id')
  @UseGuards(TokenGuard)
  async GetListing(@Req() req: Request, @Param('id') id: string) {
    const listing = await this.listingService.getListing(id);
    return listing;
  }

  @Get('/:id/applicants')
  @UseGuards(TokenGuard)
  async GetListingApplicants(@Req() req: Request, @Param('id') id: string) {
    const applicants = await this.listingService.getListingApplicants(id);
    return applicants;
  }

  @Post('/:id/apply')
  @UseGuards(TokenGuard)
  async ApplyToListing(@Req() req: Request, @Param('id') id: string) {
    return await this.listingService.applyToListing(id, req['userId']);
  }

  @Post('/:id/freelancer')
  @UseGuards(TokenGuard)
  async SelectFreelancer(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() form: SelectFreelancerDto,
  ) {
    return await this.listingService.selectFreelancer(
      id,
      req['userId'],
      form.freelancerId,
    );
  }

  @Post('/:id/rate_lister')
  @UseGuards(TokenGuard)
  async RateLister(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() form: ApproveCompletionDto,
  ) {
    return await this.listingService.rateLister(
      id,
      req['userId'],
      form.rating,
      form.review,
    );
  }
  @Post('/:id/approve')
  @UseGuards(TokenGuard)
  async ApproveListingCompletion(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() form: ApproveCompletionDto,
  ) {
    return await this.listingService.approveCompletion(
      id,
      req['userId'],
      form.rating,
      form.review,
    );
  }

  @Post('/:id/comment')
  @UseGuards(TokenGuard)
  async AddCommentToListing(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() form: CreateCommentDto,
  ) {
    return await this.listingService.addCommentToListing(
      id,
      req['userId'],
      form.comment,
    );
  }

  @Post('/:id/chats')
  @UseGuards(TokenGuard)
  async AddChatToListing(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() form: CreateChatDto,
  ) {
    return await this.listingService.addChatToListing(
      id,
      req['userId'],
      form.message,
    );
  }

  @Get('/:id/chats')
  @UseGuards(TokenGuard)
  async GetListingChats(@Req() req: Request, @Param('id') id: string) {
    return await this.listingService.getListingChats(id);
  }
}

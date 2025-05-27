import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
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
      files,
    );
  }

  @Get('')
  @UseGuards(TokenGuard)
  async GetListings(@Req() req: Request) {
    const listings = await this.listingService.getListings();
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

  @Get('/:id/apply')
  @UseGuards(TokenGuard)
  async ApplyToListing(@Req() req: Request, @Param('id') id: string) {
    return await this.listingService.applyToListing(id, req['userId']);
  }
}

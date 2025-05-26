import {
  Body,
  Controller,
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
      files,
    );
  }

  @Get('')
  async GetListings(@Req() req: Request) {
    const listings = await this.listingService.getListings();
    console.log(listings);
    return listings;
  }
}

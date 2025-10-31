import { Module } from '@nestjs/common';
import { ArticleNumberService } from './article-number.service';
import { ArticleNumberController } from './article-number.controller';

@Module({
  controllers: [ArticleNumberController],
  providers: [ArticleNumberService],
})
export class ArticleNumberModule {}

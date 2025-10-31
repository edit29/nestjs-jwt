import { Controller } from '@nestjs/common';
import { ArticleNumberService } from './article-number.service';

@Controller('article-number')
export class ArticleNumberController {
  constructor(private readonly articleNumberService: ArticleNumberService) {}
}

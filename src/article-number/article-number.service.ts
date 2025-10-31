import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // Путь к твоему PrismaService

@Injectable()
export class ArticleNumberService {
    constructor(private readonly prisma: PrismaService) {}

  async generateUniqueArticleNumber(): Promise<string> {
    let articleNumber: string = "none";
    let isUnique = false;
    const maxAttempts = 10; // Максимальное количество попыток генерации перед тем как сдаться
    for (let i = 0; i < maxAttempts && !isUnique; i++) {
      // Генерируем случайное число от 100,000 до 999,999 включительно.
      // Это гарантирует, что число всегда будет шестизначным без ведущих нулей.
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      articleNumber = randomNum.toString();
      // Проверяем, существует ли уже такой артикул в базе данных
      const existingProduct = await this.prisma.product.findUnique({
        where: { articleNumber },
        select: { id: true }, // Выбираем только id, чтобы запрос был легким
      });
      if (!existingProduct) {
        isUnique = true;
      } else {
        console.warn(`Артикул с номером ${articleNumber} уже существует...`);
      }
    }
    if (!isUnique) {
      throw new InternalServerErrorException('После нескольких попыток не удалось сгенерировать уникальный номер артикула.');
    }
    return articleNumber;
  }

}

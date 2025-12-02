import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

type BitrixProductPayload = Partial<{
	ARTICLE_NUMBER: string;
	NAME: string;
	PRICE: string | number;
	DESCRIPTION: string;
	IN_STOCK: string | number;
	TAG: string;
	YEAR: string;
}>;

@Injectable()
export class BitrixService {
	private readonly logger = new Logger(BitrixService.name);
	constructor(private readonly prisma: PrismaService) {}

	/**
	 * Handle product update payload from Bitrix24.
	 * We upsert product by articleNumber (ARTICLE_NUMBER). If missing, we skip.
	 */
	async handleProductUpdate(payload: BitrixProductPayload) {
		const articleNumber = (payload.ARTICLE_NUMBER ?? payload['article_number'] ?? payload['articleNumber']) as string | undefined;
		if (!articleNumber) {
			this.logger.warn('Bitrix product payload missing ARTICLE_NUMBER — skipping');
			return { success: false, reason: 'missing_article_number' };
		}

		const name = (payload.NAME ?? payload['name']) as string | undefined;
		const price = payload.PRICE ? Number(payload.PRICE) : undefined;
		const description = payload.DESCRIPTION as string | undefined;
		const in_stock = payload.IN_STOCK ? Number(payload.IN_STOCK) : undefined;
		const tag = payload.TAG as string | undefined;
		const year = payload.YEAR as string | undefined;

		try {
			const product = await this.prisma.product.upsert({
				where: { articleNumber },
				update: {
					name: name ?? undefined,
					price: price ?? undefined,
					description: description ?? undefined,
					in_stock: in_stock ?? undefined,
					tag: tag ?? undefined,
					year: year ?? undefined,
				},
				create: {
					articleNumber,
					name: name ?? articleNumber,
					price: price ?? 0,
					description: description ?? null,
					in_stock: in_stock ?? 0,
					tag: tag ?? 'UNTYPE',
					year: year ?? null,
				},
			});

			this.logger.log(`Upserted product ${product.id} (${articleNumber}) from Bitrix`);
			return { success: true, product };
		} catch (err) {
			this.logger.error('Error upserting product from Bitrix', err as any);
			return { success: false, error: err };
		}
	}
}

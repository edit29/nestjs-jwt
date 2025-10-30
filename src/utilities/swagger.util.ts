import type { INestApplication } from "@nestjs/common";
import { SwaggerModule } from '@nestjs/swagger';
import { getSwaggerConfig } from "src/config/swagger.config";

export function setupSwagger(app: INestApplication){
    const config = getSwaggerConfig();

  const document = SwaggerModule.createDocument(app, config, {
    include: [],
    //deepScanRoutes: true,
    //extraModels: [MovieResponse],
    operationIdFactory: (controllerKey, methodKey) => `${controllerKey}-${methodKey}`
  });

  SwaggerModule.setup('/docs', app, document, {
    jsonDocumentUrl: '/swagger.json',
    yamlDocumentUrl: '/swagger.yaml',
  });
}
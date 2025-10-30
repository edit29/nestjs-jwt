import { Controller, Get, Param } from '@nestjs/common';
import { BoilerPartsService } from './boiler-parts.service';
import { Product } from '@prisma/client';

@Controller('find')
export class BoilerPartsController {
  constructor(private readonly boilerPartsService: BoilerPartsService) {}

  @Get()
  findAll(){
    return this.boilerPartsService.findAll();
  }

  @Get('id/:id')
  findById(@Param('id') id: string){
    return this.boilerPartsService.findById(id);
  }

  @Get('tag/:tag')
  findByTag(@Param("tag") tag: string): Promise<Product[]>{
    return this.boilerPartsService.findByTag(tag);
  }

  @Get('name/:name')
  findByName(@Param("name") name: string): Promise<Product[]>{
    return this.boilerPartsService.findByName(name);
  }
}

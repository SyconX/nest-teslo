
// Recoger PartialTypes de swagger para propiedades opcional en documentacion
// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger'; 
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PartialType(CreateProductDto) {}

import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsIn, IsInt, IsNumber, IsOptional, IsPositive, IsString, MinLength } from "class-validator";

export class CreateProductDto {
    @ApiProperty()
    @IsIn(['men', 'women', 'kid', 'unisex'])
    gender: string;
    
    @ApiProperty({
        description: 'Product title',
        nullable: false,
        minLength: 1
      })
    @IsString()
    @MinLength(1)
    title: string;
    
    @ApiProperty()
    @IsString({ each: true })
    @IsArray()
    sizes: string[];
    
    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsString()
    description?: string;
    
    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsNumber()
    @IsPositive()
    price?: number;
    
    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    tags?: string[];
    
    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsString()
    slug?: string;
    
    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsInt()
    @IsPositive()
    stock?: number;
    
    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsString({ each: true })
    @IsArray()
    images?: string[];
}

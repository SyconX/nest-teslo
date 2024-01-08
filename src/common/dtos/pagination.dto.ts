import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsOptional, IsPositive, Min } from "class-validator";

export class PaginationDto {
  @ApiProperty({
    description: 'Limit of items per page',
    default: 10
  })
  @IsOptional()
  @IsPositive()
  @Type( ()=> Number )
  limit?: number;    
  
  @ApiProperty({
    description: 'Offset of items per page',
    default: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type( ()=> Number )
  offset?: number;    


}
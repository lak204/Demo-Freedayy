import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class UpdateHostDto {
  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsString()
  businessName?: string;

  @IsOptional()
  @IsString()
  businessAddress?: string;

  @IsOptional()
  @IsString()
  businessPhone?: string;

  @IsOptional()
  @IsBoolean()
  verified?: boolean;
}

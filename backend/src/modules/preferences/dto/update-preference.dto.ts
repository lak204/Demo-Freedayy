import {
  IsArray,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator';

export class UpdatePreferenceDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoredTags?: string[];

  @IsOptional()
  @IsNumber()
  maxBudget?: number;

  @IsOptional()
  @IsNumber()
  radiusKm?: number;

  @IsOptional()
  @IsBoolean()
  weekendOnly?: boolean;
}

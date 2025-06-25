import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max, IsMongoId } from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  @IsNotEmpty()
  eventId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  comment?: string;
}

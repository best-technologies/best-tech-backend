import { IsNotEmpty } from 'class-validator';

export class CreateSubcategoryDto {
  @IsNotEmpty()
  subcategoryName: string;

  @IsNotEmpty()
  categoryId: string;
}

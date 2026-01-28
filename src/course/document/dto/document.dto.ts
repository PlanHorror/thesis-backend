import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  courseOnSemesterId: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  title: string;
}

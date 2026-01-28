import { IsNotEmpty, IsString } from 'class-validator';

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
  @IsNotEmpty()
  title: string;
}

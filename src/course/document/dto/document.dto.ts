import { IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  courseId: string;
}

export class UpdateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title: string;
}

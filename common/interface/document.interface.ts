export interface DocumentCreate {
  title: string;
  courseOnSemesterId: string;
  file: Express.Multer.File;
}

export interface DocumentUpdate {
  id: string;
  title?: string;
  file?: Express.Multer.File;
}

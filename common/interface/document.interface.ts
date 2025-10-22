export interface DocumentCreate {
  title: string;
  courseId: string;
  file: Express.Multer.File;
}

export interface DocumentUpdate {
  id: string;
  title?: string;
  file?: Express.Multer.File;
}

export interface DocumentCreate {
  title: string;
  courseId: string;
  file: Express.Multer.File;
}

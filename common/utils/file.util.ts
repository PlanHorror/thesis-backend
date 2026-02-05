import { BadRequestException } from "@nestjs/common";
import * as fs from "fs";

export function generateFileName(file: Express.Multer.File): string {
  const timestamp = Date.now();
  const originalName = file.originalname.replace(/\s+/g, "_");
  return `${timestamp}_${originalName}`;
}

export async function saveFile(
  file: Express.Multer.File,
  path: string,
): Promise<void> {
  try {
    await fs.promises.writeFile(path, file.buffer);
  } catch (error) {
    console.error("Error saving file:", error);
    throw new BadRequestException("Error saving file");
  }
}

export async function deleteFile(path: string): Promise<void> {
  try {
    await fs.promises.unlink(path);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new BadRequestException("Error deleting file");
  }
}

import { BadRequestException } from "@nestjs/common";
import * as fs from "node:fs";
import * as path from "node:path";

export function generateFileName(file: Express.Multer.File): string {
  const timestamp = Date.now();
  const originalName = file.originalname.replace(/\s+/g, "_");
  return `${timestamp}_${originalName}`;
}

export async function saveFile(
  file: Express.Multer.File,
  targetPath: string,
): Promise<void> {
  try {
    // Ensure parent directory exists (e.g. "attachments/")
    const dir = path.dirname(targetPath);
    await fs.promises.mkdir(dir, { recursive: true });

    await fs.promises.writeFile(targetPath, file.buffer);
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

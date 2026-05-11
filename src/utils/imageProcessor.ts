import sharp, { Sharp } from 'sharp';
import path from 'path';
import fs from 'fs';
import { promises as fsPromises } from 'fs';

// Base directories for images
export const IMAGES_DIR = path.join(__dirname, '../../images');
export const FULL_DIR = path.join(IMAGES_DIR, 'full');
export const THUMB_DIR = path.join(IMAGES_DIR, 'thumb');

/**
 * Parameters for image resizing
 */
export interface ResizeParams {
  filename: string;
  width: number;
  height: number;
}

/**
 * Ensures the thumbnail directory exists
 */
export const ensureThumbDir = async (): Promise<void> => {
  await fsPromises.mkdir(THUMB_DIR, { recursive: true });
};

/**
 * Generates the cache filename for a resized image
 */
export const getCacheFilename = (filename: string, width: number, height: number): string => {
  const name = path.parse(filename).name;
  return `${name}_${width}x${height}.jpg`;
};

/**
 * Checks if a cached (already resized) image exists
 */
export const cacheExists = async (
  filename: string,
  width: number,
  height: number
): Promise<boolean> => {
  const cacheFile = path.join(THUMB_DIR, getCacheFilename(filename, width, height));
  try {
    await fsPromises.access(cacheFile, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * Checks if the source (full-size) image exists
 */
export const sourceExists = async (filename: string): Promise<boolean> => {
  const sourcePath = path.join(FULL_DIR, filename.endsWith('.jpg') ? filename : `${filename}.jpg`);
  try {
    await fsPromises.access(sourcePath, fs.constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

/**
 * Core image processing function using Sharp.
 * Resizes an image and saves it to the thumb directory.
 * Returns the path to the resized image.
 */
export const processImage = async (params: ResizeParams): Promise<string> => {
  const { filename, width, height } = params;

  // Normalize filename
  const normalizedFilename = filename.endsWith('.jpg') ? filename : `${filename}.jpg`;
  const sourcePath = path.join(FULL_DIR, normalizedFilename);
  const cacheFilename = getCacheFilename(normalizedFilename, width, height);
  const outputPath = path.join(THUMB_DIR, cacheFilename);

  // Ensure thumb dir exists
  await ensureThumbDir();

  // If cached version exists, return it
  if (await cacheExists(normalizedFilename, width, height)) {
    return outputPath;
  }

  // Process with Sharp
  const sharpInstance: Sharp = sharp(sourcePath);

  await sharpInstance
    .resize(width, height, {
      fit: 'cover',
      position: 'center',
    })
    .jpeg({ quality: 85 })
    .toFile(outputPath);

  return outputPath;
};

/**
 * Lists all available images in the full directory
 */
export const listAvailableImages = async (): Promise<string[]> => {
  try {
    const files = await fsPromises.readdir(FULL_DIR);
    return files
      .filter((file) => file.toLowerCase().endsWith('.jpg'))
      .map((file) => path.parse(file).name);
  } catch {
    return [];
  }
};

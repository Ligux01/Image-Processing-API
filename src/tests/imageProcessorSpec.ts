import path from 'path';
import fs from 'fs';
import {
  getCacheFilename,
  cacheExists,
  sourceExists,
  listAvailableImages,
  FULL_DIR,
  THUMB_DIR,
  ensureThumbDir,
  processImage,
} from '../utils/imageProcessor';

describe('Image Processor Utility Tests', () => {
  const testImageName = 'encenadaport';
  const testWidth = 100;
  const testHeight = 100;

  describe('getCacheFilename()', () => {
    it('should generate correct cache filename from params', () => {
      const result = getCacheFilename('encenadaport.jpg', 200, 300);
      expect(result).toBe('encenadaport_200x300.jpg');
    });

    it('should handle filenames without extension', () => {
      const result = getCacheFilename('image', 100, 100);
      expect(result).toBe('image_100x100.jpg');
    });

    it('should include both width and height in filename', () => {
      const result = getCacheFilename('test.jpg', 640, 480);
      expect(result).toContain('640');
      expect(result).toContain('480');
    });
  });

  describe('ensureThumbDir()', () => {
    it('should create the thumb directory if it does not exist', async () => {
      await ensureThumbDir();
      const exists = fs.existsSync(THUMB_DIR);
      expect(exists).toBeTrue();
    });
  });

  describe('sourceExists()', () => {
    it('should return false for a non-existent image', async () => {
      const result = await sourceExists('definitely_not_a_real_image_12345');
      expect(result).toBeFalse();
    });

    it('should return true if the image exists in the full directory', async () => {
      // Only runs if encenadaport.jpg is in images/full
      const files = fs.existsSync(FULL_DIR) ? fs.readdirSync(FULL_DIR) : [];
      if (files.includes('encenadaport.jpg')) {
        const result = await sourceExists(testImageName);
        expect(result).toBeTrue();
      } else {
        pending('encenadaport.jpg not present in images/full — skipping');
      }
    });
  });

  describe('cacheExists()', () => {
    it('should return false when no cached thumbnail exists yet', async () => {
      const result = await cacheExists('nonexistent_file.jpg', 999, 999);
      expect(result).toBeFalse();
    });
  });

  describe('listAvailableImages()', () => {
    it('should return an array', async () => {
      const images = await listAvailableImages();
      expect(Array.isArray(images)).toBeTrue();
    });

    it('should not include file extensions in the result', async () => {
      const images = await listAvailableImages();
      for (const img of images) {
        expect(img.endsWith('.jpg')).toBeFalse();
      }
    });
  });

  describe('processImage()', () => {
    it('should process and cache an image if the source exists', async () => {
      const files = fs.existsSync(FULL_DIR) ? fs.readdirSync(FULL_DIR) : [];
      if (!files.includes('encenadaport.jpg')) {
        pending('encenadaport.jpg not present in images/full — skipping');
        return;
      }

      const outputPath = await processImage({
        filename: testImageName,
        width: testWidth,
        height: testHeight,
      });

      const outputExists = fs.existsSync(outputPath);
      expect(outputExists).toBeTrue();
    });

    it('should serve from cache on repeated requests', async () => {
      const files = fs.existsSync(FULL_DIR) ? fs.readdirSync(FULL_DIR) : [];
      if (!files.includes('encenadaport.jpg')) {
        pending('encenadaport.jpg not present in images/full — skipping');
        return;
      }

      const outputPath1 = await processImage({
        filename: testImageName,
        width: testWidth,
        height: testHeight,
      });

      const outputPath2 = await processImage({
        filename: testImageName,
        width: testWidth,
        height: testHeight,
      });

      // Both should point to the same cached file
      expect(outputPath1).toBe(outputPath2);

      const cachedFilename = getCacheFilename(`${testImageName}.jpg`, testWidth, testHeight);
      expect(path.basename(outputPath1)).toBe(cachedFilename);
    });

    it('should throw an error if the source image does not exist', async () => {
      await expectAsync(
        processImage({ filename: 'totally_fake_image', width: 200, height: 200 })
      ).toBeRejected();
    });
  });
});

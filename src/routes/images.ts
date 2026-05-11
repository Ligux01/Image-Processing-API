import { Router, Request, Response } from 'express';
import path from 'path';
import {
  processImage,
  sourceExists,
  cacheExists,
  listAvailableImages,
  THUMB_DIR,
  getCacheFilename,
} from '../utils/imageProcessor';

const router: Router = Router();

/**
 * Strict number validation - rejects values like "500f", "abc", "-1", "0"
 */
const isValidDimension = (value: string): boolean => {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
};

/**
 * GET /api/images
 * Query params:
 *   - filename (string, required): name of the image (without .jpg extension)
 *   - width (number, required): desired width in pixels
 *   - height (number, required): desired height in pixels
 *
 * Returns the resized image or an error message.
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { filename, width, height } = req.query;

  // --- Validate filename ---
  if (!filename) {
    res.status(400).json({
      error: 'Missing required parameter: filename',
      example: '/api/images?filename=encenadaport&width=200&height=200',
      availableImages: await listAvailableImages(),
    });
    return;
  }

  if (typeof filename !== 'string') {
    res.status(400).json({ error: 'Parameter "filename" must be a string.' });
    return;
  }

  // --- Validate width ---
  if (!width) {
    res.status(400).json({ error: 'Missing required parameter: width' });
    return;
  }

  if (!isValidDimension(width as string)) {
    res
      .status(400)
      .json({ error: 'Parameter "width" must be a positive whole number. e.g. width=200' });
    return;
  }

  // --- Validate height ---
  if (!height) {
    res.status(400).json({ error: 'Missing required parameter: height' });
    return;
  }

  if (!isValidDimension(height as string)) {
    res
      .status(400)
      .json({ error: 'Parameter "height" must be a positive whole number. e.g. height=200' });
    return;
  }

  const parsedWidth = Number(width as string);
  const parsedHeight = Number(height as string);

  // --- Check source image exists ---
  const exists = await sourceExists(filename);
  if (!exists) {
    const available = await listAvailableImages();
    res.status(404).json({
      error: `Image "${filename}" not found. Make sure the filename is correct and the image is in the images/full folder.`,
      availableImages: available,
    });
    return;
  }

  try {
    // Check if using cached image
    const isCached = await cacheExists(
      filename.endsWith('.jpg') ? filename : `${filename}.jpg`,
      parsedWidth,
      parsedHeight
    );

    // Process (or serve from cache)
    const outputPath = await processImage({
      filename,
      width: parsedWidth,
      height: parsedHeight,
    });

    // Add cache header for transparency
    res.setHeader('X-Cache', isCached ? 'HIT' : 'MISS');
    res.setHeader('Content-Type', 'image/jpeg');
    res.sendFile(outputPath);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to process image.',
      detail: err instanceof Error ? err.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/images/list
 * Returns a list of all available images
 */
router.get('/list', async (_req: Request, res: Response): Promise<void> => {
  const images = await listAvailableImages();
  res.json({ availableImages: images });
});

/**
 * GET /api/images/thumb/:filename
 * Serves a specific thumbnail directly
 */
router.get('/thumb/:filename', (req: Request, res: Response): void => {
  const { filename } = req.params;
  const thumbPath = path.join(THUMB_DIR, filename);
  res.sendFile(thumbPath, (err) => {
    if (err) {
      res.status(404).json({ error: 'Thumbnail not found.' });
    }
  });
});

export default router;
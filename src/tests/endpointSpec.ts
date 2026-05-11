import request from 'supertest';
import app from '../app';

describe('Image API Endpoint Tests', () => {
  describe('GET /', () => {
    it('should return API info on the root route', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.message).toBeDefined();
    });
  });

  describe('GET /api/images', () => {
    it('should return 400 when no query params are provided', async () => {
      const res = await request(app).get('/api/images');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('filename');
    });

    it('should return 400 when width is missing', async () => {
      const res = await request(app).get('/api/images?filename=encenadaport&height=200');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('width');
    });

    it('should return 400 when height is missing', async () => {
      const res = await request(app).get('/api/images?filename=encenadaport&width=200');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('height');
    });

    it('should return 400 when width is not a valid number', async () => {
      const res = await request(app).get('/api/images?filename=encenadaport&width=abc&height=200');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('width');
    });

    it('should return 400 when height is not a valid number', async () => {
      const res = await request(app).get('/api/images?filename=encenadaport&width=200&height=abc');
      expect(res.status).toBe(400);
      expect(res.body.error).toContain('height');
    });

    it('should return 400 when width is zero or negative', async () => {
      const res = await request(app).get('/api/images?filename=encenadaport&width=0&height=200');
      expect(res.status).toBe(400);
    });

    it('should return 404 when the image file does not exist', async () => {
      const res = await request(app).get(
        '/api/images?filename=nonexistentimage&width=200&height=200'
      );
      expect(res.status).toBe(404);
      expect(res.body.error).toContain('nonexistentimage');
    });
  });

  describe('GET /api/images/list', () => {
    it('should return a list of available images', async () => {
      const res = await request(app).get('/api/images/list');
      expect(res.status).toBe(200);
      expect(res.body.availableImages).toBeDefined();
      expect(Array.isArray(res.body.availableImages)).toBeTrue();
    });
  });
});

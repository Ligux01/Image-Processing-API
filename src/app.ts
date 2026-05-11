import express, { Application } from 'express';
import imageRoutes from './routes/images';

const app: Application = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/images', imageRoutes);

// Health check route
app.get('/', (_req, res) => {
  res.json({
    message: 'Image Processing API is running',
    endpoints: {
      images: '/api/images?filename=<name>&width=<pixels>&height=<pixels>',
    },
  });
});

export default app;

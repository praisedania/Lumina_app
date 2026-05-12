import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();

// Global Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic Health Check Route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'success', message: 'Lumina API is running' });
});

// Import and use routes here
import routes from './routes/index.js';
app.use('/api', routes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({ status: 'error', message: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error'
  });
});

export default app;

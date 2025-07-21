// src/index.ts
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';

import { registerRoute } from './routes';
import { authenticate } from './middleware';

const app = express();
app.use(cors());
app.use(express.json());

// Public routes
registerRoute(app);

// Protect everything below this line
app.use(authenticate);

// Example protected route
app.get('/api/me', (req, res) => {
  // @ts-ignore
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🟢 API listening on http://localhost:${PORT}`);
});

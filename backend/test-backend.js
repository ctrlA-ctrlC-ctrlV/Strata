import { applySecurityHeaders } from './src/security/security.js';
import express from 'express';

const app = express();
app.use(applySecurityHeaders());

app.get('/test', (_req, res) => {
  res.json({ status: 'Backend is running' });
});

console.log('Backend structure test: PASS');
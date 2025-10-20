import dotenv from 'dotenv';
dotenv.config();
import express, { type Request, type Response } from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { applySecurityHeaders } from '../security/security.js';
import contactRouter from './contact.js';
import quotesRouter from './quotes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helmet baseline
app.use(helmet({
  contentSecurityPolicy: false // use custom CSP in applySecurityHeaders
}));

// Rate limiting for all POST endpoints
const limiter = rateLimit({ windowMs: 60_000, max: 60 });
app.use(limiter);

// Custom security middleware (CSP etc.)
app.use(applySecurityHeaders());

// Static serve success templates (optional)
app.use('/api/views', express.static(path.join(__dirname, 'views')));

// Form endpoints (no-JS fallbacks supported)
app.use('/api', contactRouter);
app.use('/api', quotesRouter);

// Fallback health
app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

const port = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on :${port}`);
});

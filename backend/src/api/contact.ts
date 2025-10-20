import { Router, type Request, type Response } from 'express';
import { ContactSchema } from '../services/validation.js';

const router = Router();

router.post('/contact', (req: Request, res: Response) => {
  const parse = ContactSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input', issues: parse.error.flatten() });
  }
  // Defer actual email/db for later tasks; for now redirect to success view
  return res.redirect(303, '/api/views/contact-success.html');
});

export default router;

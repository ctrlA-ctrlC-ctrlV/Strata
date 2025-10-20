import { Router, type Request, type Response } from 'express';
import { QuoteSchema } from '../services/validation.js';
import { createQuote } from '../db/repos/quotes.js';
import { sendMail } from '../services/mailer.js';

const router = Router();

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

router.post('/quotes', async (req: Request, res: Response) => {
  const parse = QuoteSchema.safeParse(req.body);
  if (!parse.success) {
    return res.status(400).json({ error: 'Invalid input', issues: parse.error.flatten() });
  }
  const { data } = parse;
  try {
    const created = await createQuote({
      customer: { name: data.name, email: data.email },
      eircode: data.eircode,
      county: data.county,
      phone: data.phone,
      address: data.address
    });
    // Fire-and-forget notifications (do not block redirect)
    const internalTo = process.env.QUOTES_NOTIFY_TO || process.env.SMTP_FROM;
    if (internalTo) {
      const b: any = req.body || {};
      const designBits = [
        b.widthM && b.depthM ? `<li><strong>Size:</strong> ${escapeHtml(String(b.widthM))}m x ${escapeHtml(String(b.depthM))}m</li>` : '',
        b.cladding ? `<li><strong>Cladding:</strong> ${escapeHtml(String(b.cladding))}</li>` : '',
        b.bathroom ? `<li><strong>Bathroom:</strong> ${escapeHtml(String(b.bathroom))}</li>` : '',
        b.floor ? `<li><strong>Floor:</strong> ${escapeHtml(String(b.floor))}</li>` : '',
        (b.openings_windows || b.openings_doors || b.openings_skylights)
          ? `<li><strong>Openings:</strong> ${escapeHtml(String(b.openings_windows || 0))} windows, ${escapeHtml(String(b.openings_doors || 0))} doors, ${escapeHtml(String(b.openings_skylights || 0))} skylights</li>`
          : '',
        b.extras ? `<li><strong>Extras:</strong> ${escapeHtml(String(b.extras))}</li>` : ''
      ].filter(Boolean).join('');
      const html = `
        <h1>New Quote ${created.quoteNumber}</h1>
        <p>A new quote request has been submitted.</p>
        <ul>
          <li><strong>Name:</strong> ${escapeHtml(data.name)}</li>
          <li><strong>Email:</strong> ${escapeHtml(data.email)}</li>
          ${data.phone ? `<li><strong>Phone:</strong> ${escapeHtml(data.phone)}</li>` : ''}
          ${data.address ? `<li><strong>Address:</strong> ${escapeHtml(data.address)}</li>` : ''}
          <li><strong>Eircode:</strong> ${escapeHtml(data.eircode)}</li>
          <li><strong>County:</strong> ${escapeHtml(data.county)}</li>
        </ul>
        ${designBits ? `<h2>Design Summary</h2><ul>${designBits}</ul>` : ''}
      `;
      sendMail({ to: String(internalTo), subject: `New quote ${created.quoteNumber}`, html }).catch(() => {});
    }
    // Customer confirmation (fire-and-forget)
    const userHtml = `
      <p>Hi ${escapeHtml(data.name)},</p>
      <p>Thanks for your interest. We've received your quote request <strong>${created.quoteNumber}</strong>.</p>
      <p>Our team will review your details and follow up shortly. You can reply to this email if you have any questions.</p>
      <p><strong>Location:</strong> ${escapeHtml(data.county)} · ${escapeHtml(data.eircode)}</p>
      <p>— The Team</p>
    `;
    sendMail({ to: data.email, subject: `We've received your quote ${created.quoteNumber}`, html: userHtml, text: `Hi ${data.name},\n\nWe've received your quote request ${created.quoteNumber}. We'll be in touch shortly.\n\n— The Team` }).catch(() => {});
  } catch {
    // swallow persistence errors for MVP; future: show proper error page
  }
  return res.redirect(303, '/api/views/quote-success.html');
});

export default router;

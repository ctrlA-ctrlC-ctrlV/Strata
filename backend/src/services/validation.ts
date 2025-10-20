import { z } from 'zod';

export const AllowedCounty = z.enum(['Dublin', 'Wicklow', 'Kildare']);

// Eircode regex approximates Irish format (routing key + unique identifier)
// Examples: A65 F4E2, D6W 1W23
export const EIRCODE_REGEX = /^(?:D6W|[AC-FHKNPRTV-Y][0-9]{2})\s?[0-9AC-FHKNPRTV-Y]{4}$/i;
export const Eircode = z.string().regex(EIRCODE_REGEX, 'Invalid Eircode');

export const ContactSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  message: z.string().optional()
});

export const QuoteSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  address: z.string().optional(),
  eircode: Eircode,
  county: AllowedCounty
});

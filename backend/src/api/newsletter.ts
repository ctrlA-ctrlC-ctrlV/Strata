// Newsletter API Endpoint - Phase 9
// User Story 6: Subscribe for Offers (Newsletter)

import { Request, Response } from 'express';
import { z } from 'zod';

// Newsletter subscription request schema
const NewsletterSubscriptionSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .min(1, 'Email is required')
    .max(254, 'Email address is too long'), // RFC 5321 limit
  source: z.string().optional().default('landing-page'),
  timestamp: z.date().optional().default(() => new Date())
});

// Newsletter subscription response interface
export interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
  email?: string;
  subscriptionId?: string;
}

// Validation error interface
interface ValidationError {
  field: string;
  message: string;
}

/**
 * Handle newsletter subscription requests
 * POST /api/newsletter-subscriptions
 */
export async function createNewsletterSubscription(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Validate request body
    const validationResult = NewsletterSubscriptionSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errors: ValidationError[] = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
      return;
    }

    const { email, source } = validationResult.data;

    // Check for existing subscription
    const existingSubscription = await checkExistingSubscription(email);
    
    if (existingSubscription) {
      res.status(200).json({
        success: true,
        message: 'You are already subscribed to our newsletter!',
        email
      });
      return;
    }

    // Create new subscription
    const subscriptionId = await createSubscription({
      email,
      source,
      subscribedAt: new Date(),
      status: 'active'
    });

    // Log successful subscription
    console.log(`Newsletter subscription created: ${email} (ID: ${subscriptionId})`);

    // Send success response
    res.status(201).json({
      success: true,
      message: 'Thank you! You have been successfully subscribed to our newsletter.',
      email,
      subscriptionId
    } as NewsletterSubscriptionResponse);

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your subscription. Please try again.'
    });
  }
}

/**
 * Check if email is already subscribed
 */
async function checkExistingSubscription(email: string): Promise<boolean> {
  try {
    // In a real implementation, this would query the database
    // For now, we'll simulate with a simple check
    
    // TODO: Replace with actual database query
    // Example using Supabase:
    // const { data, error } = await supabase
    //   .from('newsletter_subscriptions')
    //   .select('id')
    //   .eq('email', email)
    //   .eq('status', 'active')
    //   .single();
    // 
    // return !!data && !error;

    // Temporary implementation - always return false for new subscriptions
    return false;

  } catch (error) {
    console.error('Error checking existing subscription:', error);
    return false;
  }
}

/**
 * Create a new newsletter subscription
 */
async function createSubscription(subscriptionData: {
  email: string;
  source: string;
  subscribedAt: Date;
  status: 'active' | 'inactive';
}): Promise<string> {
  try {
    // Generate temporary subscription ID
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TODO: Replace with actual database insertion
    // Example using Supabase:
    // const { data, error } = await supabase
    //   .from('newsletter_subscriptions')
    //   .insert([{
    //     email: subscriptionData.email,
    //     source: subscriptionData.source,
    //     subscribed_at: subscriptionData.subscribedAt.toISOString(),
    //     status: subscriptionData.status,
    //     created_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString()
    //   }])
    //   .select('id')
    //   .single();
    //
    // if (error) {
    //   throw error;
    // }
    //
    // return data.id;

    // Temporary implementation - log subscription data and return mock ID
    console.log('Newsletter subscription data:', {
      id: subscriptionId,
      ...subscriptionData
    });

    return subscriptionId;

  } catch (error) {
    console.error('Error creating subscription:', error);
    throw new Error('Failed to create subscription');
  }
}

/**
 * Get all newsletter subscriptions (admin endpoint)
 * GET /api/newsletter-subscriptions
 */
export async function getNewsletterSubscriptions(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // Basic pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    // TODO: Replace with actual database query
    // Example using Supabase:
    // const { data, error, count } = await supabase
    //   .from('newsletter_subscriptions')
    //   .select('*', { count: 'exact' })
    //   .eq('status', 'active')
    //   .order('created_at', { ascending: false })
    //   .range(offset, offset + limit - 1);
    //
    // if (error) {
    //   throw error;
    // }

    // Temporary implementation
    const mockSubscriptions = [
      {
        id: 'sub_1',
        email: 'test@example.com',
        source: 'landing-page',
        status: 'active',
        subscribedAt: new Date().toISOString()
      }
    ];

    res.status(200).json({
      success: true,
      data: mockSubscriptions,
      pagination: {
        page,
        limit,
        total: mockSubscriptions.length,
        totalPages: Math.ceil(mockSubscriptions.length / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching newsletter subscriptions:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching subscriptions.'
    });
  }
}

/**
 * Unsubscribe from newsletter
 * DELETE /api/newsletter-subscriptions/:email
 */
export async function unsubscribeFromNewsletter(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const { email } = req.params;

    // Validate email parameter
    const emailValidation = z.string().email().safeParse(email);
    
    if (!emailValidation.success) {
      res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
      return;
    }

    // TODO: Replace with actual database update
    // Example using Supabase:
    // const { error } = await supabase
    //   .from('newsletter_subscriptions')
    //   .update({ 
    //     status: 'inactive',
    //     unsubscribed_at: new Date().toISOString(),
    //     updated_at: new Date().toISOString()
    //   })
    //   .eq('email', email)
    //   .eq('status', 'active');
    //
    // if (error) {
    //   throw error;
    // }

    // Temporary implementation
    console.log(`Newsletter unsubscription: ${email}`);

    res.status(200).json({
      success: true,
      message: 'You have been successfully unsubscribed from our newsletter.',
      email
    });

  } catch (error) {
    console.error('Newsletter unsubscription error:', error);
    
    res.status(500).json({
      success: false,
      message: 'An error occurred while processing your unsubscription. Please try again.'
    });
  }
}

/**
 * Health check for newsletter service
 * GET /api/newsletter-subscriptions/health
 */
export async function checkNewsletterHealth(
  req: Request,
  res: Response
): Promise<void> {
  try {
    // TODO: Add database connectivity check
    // Example:
    // const { data, error } = await supabase
    //   .from('newsletter_subscriptions')
    //   .select('count(*)')
    //   .limit(1);

    res.status(200).json({
      success: true,
      message: 'Newsletter service is healthy',
      timestamp: new Date().toISOString(),
      service: 'newsletter-api'
    });

  } catch (error) {
    console.error('Newsletter health check failed:', error);
    
    res.status(503).json({
      success: false,
      message: 'Newsletter service is unavailable',
      timestamp: new Date().toISOString(),
      service: 'newsletter-api'
    });
  }
}
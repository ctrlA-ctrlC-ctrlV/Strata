import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

/**
 * Testimonial data structure matching frontend interface
 */
interface TestimonialData {
  id: string;
  quote: string;
  rating: number;
  authorFirstName: string;
  authorInitial: string;
  projectArea: string;
  image?: {
    src: string;
    alt: string;
    width: number;
    height: number;
    srcset?: string;
  };
}

/**
 * Query parameters for testimonials endpoint
 */
interface TestimonialsQuery {
  limit?: string;
  offset?: string;
  rating?: string;
  projectArea?: string;
  featured?: string;
}

/**
 * Static testimonial data for demo purposes
 * In production, this would come from a database
 */
const staticTestimonials: TestimonialData[] = [
  {
    id: 'testimonial-1',
    quote: 'The garden room exceeded all our expectations. The quality of workmanship is outstanding, and the planning permission process was handled seamlessly. We now have the perfect home office.',
    rating: 5,
    authorFirstName: 'Sarah',
    authorInitial: 'M',
    projectArea: 'Dublin',
    image: {
      src: '/images/testimonials/sarah-m.jpg',
      alt: 'Sarah M. testimonial photo',
      width: 80,
      height: 80
    }
  },
  {
    id: 'testimonial-2',
    quote: 'From initial consultation to final handover, the service was professional and efficient. Our home extension has transformed our living space and added significant value to our property.',
    rating: 5,
    authorFirstName: 'Michael',
    authorInitial: 'O',
    projectArea: 'Cork',
    image: {
      src: '/images/testimonials/michael-o.jpg',
      alt: 'Michael O. testimonial photo',
      width: 80,
      height: 80
    }
  },
  {
    id: 'testimonial-3',
    quote: 'Exceptional attention to detail and customer service. The 10-year warranty gives us complete peace of mind. Highly recommend for anyone considering a garden room.',
    rating: 5,
    authorFirstName: 'Emma',
    authorInitial: 'K',
    projectArea: 'Galway',
    image: {
      src: '/images/testimonials/emma-k.jpg',
      alt: 'Emma K. testimonial photo',
      width: 80,
      height: 80
    }
  },
  {
    id: 'testimonial-4',
    quote: 'The project was completed on time and within budget. The team was professional, clean, and respectful of our property. The final result is exactly what we wanted.',
    rating: 5,
    authorFirstName: 'David',
    authorInitial: 'R',
    projectArea: 'Limerick'
  },
  {
    id: 'testimonial-5',
    quote: 'Outstanding quality construction and excellent customer service throughout. The insulation and electrical work are top-notch. Perfect for working from home.',
    rating: 5,
    authorFirstName: 'Lisa',
    authorInitial: 'T',
    projectArea: 'Waterford'
  },
  {
    id: 'testimonial-6',
    quote: 'We\'re delighted with our new home extension. The design consultation was thorough and the build quality is exceptional. Worth every penny.',
    rating: 5,
    authorFirstName: 'John',
    authorInitial: 'S',
    projectArea: 'Kerry'
  },
  {
    id: 'testimonial-7',
    quote: 'The planning permission process was handled professionally and efficiently. The garden room is beautifully crafted and has become our favorite space.',
    rating: 5,
    authorFirstName: 'Rachel',
    authorInitial: 'B',
    projectArea: 'Meath'
  },
  {
    id: 'testimonial-8',
    quote: 'Highly professional service from start to finish. The quality of materials and craftsmanship is evident in every detail. Excellent value for money.',
    rating: 5,
    authorFirstName: 'Paul',
    authorInitial: 'H',
    projectArea: 'Kildare'
  }
];

/**
 * GET /api/testimonials
 * Returns a list of customer testimonials with optional filtering and pagination
 */
router.get('/', (req: Request, res: Response): void => {
  try {
    const query = req.query as TestimonialsQuery;
    
    // Parse pagination parameters
    const limit = parseInt(query.limit || '10', 10);
    const offset = parseInt(query.offset || '0', 10);
    
    // Validate pagination parameters
    if (isNaN(limit) || limit < 1 || limit > 100) {
      res.status(400).json({
        error: 'Invalid limit parameter. Must be between 1 and 100.'
      });
      return;
    }
    
    if (isNaN(offset) || offset < 0) {
      res.status(400).json({
        error: 'Invalid offset parameter. Must be 0 or greater.'
      });
      return;
    }

    // Start with all testimonials
    let filteredTestimonials = [...staticTestimonials];

    // Apply rating filter
    if (query.rating) {
      const ratingFilter = parseInt(query.rating, 10);
      if (isNaN(ratingFilter) || ratingFilter < 1 || ratingFilter > 5) {
        res.status(400).json({
          error: 'Invalid rating parameter. Must be between 1 and 5.'
        });
        return;
      }
      filteredTestimonials = filteredTestimonials.filter(testimonial => 
        testimonial.rating >= ratingFilter
      );
    }

    // Apply project area filter
    if (query.projectArea) {
      const areaFilter = query.projectArea.toLowerCase();
      filteredTestimonials = filteredTestimonials.filter(testimonial =>
        testimonial.projectArea.toLowerCase().includes(areaFilter)
      );
    }

    // Apply featured filter (assumes testimonials with images are featured)
    if (query.featured === 'true') {
      filteredTestimonials = filteredTestimonials.filter(testimonial => 
        testimonial.image !== undefined
      );
    }

    // Apply pagination
    const total = filteredTestimonials.length;
    const paginatedTestimonials = filteredTestimonials.slice(offset, offset + limit);

    // Prepare response
    const response = {
      testimonials: paginatedTestimonials,
      pagination: {
        total,
        limit,
        offset,
        hasNext: offset + limit < total,
        hasPrevious: offset > 0
      },
      meta: {
        averageRating: filteredTestimonials.length > 0 
          ? filteredTestimonials.reduce((sum, t) => sum + t.rating, 0) / filteredTestimonials.length
          : 0,
        totalReviews: total,
        filters: {
          rating: query.rating || null,
          projectArea: query.projectArea || null,
          featured: query.featured || null
        }
      }
    };

    res.json(response);
    
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      error: 'Internal server error while fetching testimonials'
    });
  }
});

/**
 * GET /api/testimonials/:id
 * Returns a specific testimonial by ID
 */
router.get('/:id', (req: Request, res: Response): void => {
  try {
    const { id } = req.params;
    
    if (!id || typeof id !== 'string') {
      res.status(400).json({
        error: 'Invalid testimonial ID'
      });
      return;
    }

    const testimonial = staticTestimonials.find(t => t.id === id);
    
    if (!testimonial) {
      res.status(404).json({
        error: 'Testimonial not found'
      });
      return;
    }

    res.json({ testimonial });
    
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({
      error: 'Internal server error while fetching testimonial'
    });
  }
});

/**
 * GET /api/testimonials/stats
 * Returns testimonial statistics
 */
router.get('/stats', (req: Request, res: Response): void => {
  try {
    const stats = {
      totalTestimonials: staticTestimonials.length,
      averageRating: staticTestimonials.length > 0 
        ? staticTestimonials.reduce((sum, t) => sum + t.rating, 0) / staticTestimonials.length
        : 0,
      ratingDistribution: {
        5: staticTestimonials.filter(t => t.rating === 5).length,
        4: staticTestimonials.filter(t => t.rating === 4).length,
        3: staticTestimonials.filter(t => t.rating === 3).length,
        2: staticTestimonials.filter(t => t.rating === 2).length,
        1: staticTestimonials.filter(t => t.rating === 1).length
      },
      topAreas: Object.entries(
        staticTestimonials.reduce((areas: Record<string, number>, testimonial) => {
          areas[testimonial.projectArea] = (areas[testimonial.projectArea] || 0) + 1;
          return areas;
        }, {})
      ).sort(([, a], [, b]) => b - a).slice(0, 5),
      featuredCount: staticTestimonials.filter(t => t.image).length
    };

    res.json(stats);
    
  } catch (error) {
    console.error('Error fetching testimonial stats:', error);
    res.status(500).json({
      error: 'Internal server error while fetching testimonial stats'
    });
  }
});

export default router;
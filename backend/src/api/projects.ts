import express from 'express';
import type { Request, Response } from 'express';

const router = express.Router();

/**
 * Project data structure matching frontend interface
 */
interface ProjectData {
  id: string;
  title: string;
  location: string;
  images: string[];
  tags: string[];
  description?: string;
  category?: 'garden-room' | 'extension';
  completedDate?: string;
  size?: string;
  featured?: boolean;
}

/**
 * Static project data for demo purposes
 * In production, this would come from a database
 */
const staticProjects: ProjectData[] = [
  {
    id: 'garden-room-1',
    title: 'Modern Garden Office',
    location: 'Dublin, Ireland',
    images: ['/images/projects/garden-room-1.jpg'],
    tags: ['Garden Room', 'Office', 'Modern'],
    description: 'Contemporary garden office with floor-to-ceiling windows and sustainable materials',
    category: 'garden-room',
    completedDate: '2024-03-15',
    size: '4m x 3m',
    featured: true
  },
  {
    id: 'extension-1',
    title: 'Kitchen Extension',
    location: 'Cork, Ireland',
    images: ['/images/projects/extension-1.jpg'],
    tags: ['Extension', 'Kitchen', 'Family'],
    description: 'Open-plan kitchen extension with bifold doors to garden',
    category: 'extension',
    completedDate: '2024-02-28',
    size: '6m x 4m',
    featured: true
  },
  {
    id: 'garden-room-2',
    title: 'Garden Studio',
    location: 'Galway, Ireland',
    images: ['/images/projects/garden-room-2.jpg'],
    tags: ['Garden Room', 'Studio', 'Creative'],
    description: 'Versatile garden studio perfect for creative work and relaxation',
    category: 'garden-room',
    completedDate: '2024-01-20',
    size: '5m x 4m',
    featured: false
  },
  {
    id: 'extension-2',
    title: 'Two-Storey Extension',
    location: 'Limerick, Ireland',
    images: ['/images/projects/extension-2.jpg'],
    tags: ['Extension', 'Two-Storey', 'Family'],
    description: 'Spacious two-storey extension adding bedroom and living space',
    category: 'extension',
    completedDate: '2023-12-10',
    size: '8m x 5m',
    featured: true
  },
  {
    id: 'garden-room-3',
    title: 'Eco Garden Pod',
    location: 'Waterford, Ireland',
    images: ['/images/projects/garden-room-3.jpg'],
    tags: ['Garden Room', 'Eco', 'Sustainable'],
    description: 'Eco-friendly garden pod with green roof and solar panels',
    category: 'garden-room',
    completedDate: '2023-11-05',
    size: '3.5m x 3.5m',
    featured: false
  },
  {
    id: 'extension-3',
    title: 'Victorian Extension',
    location: 'Dublin, Ireland',
    images: ['/images/projects/extension-3.jpg'],
    tags: ['Extension', 'Victorian', 'Heritage'],
    description: 'Sympathetic extension to Victorian terrace house',
    category: 'extension',
    completedDate: '2023-10-15',
    size: '7m x 4m',
    featured: false
  },
  {
    id: 'garden-room-4',
    title: 'Home Office Pod',
    location: 'Kildare, Ireland',
    images: ['/images/projects/garden-room-4.jpg'],
    tags: ['Garden Room', 'Office', 'Insulated'],
    description: 'Fully insulated home office with high-speed internet connectivity',
    category: 'garden-room',
    completedDate: '2023-09-22',
    size: '4m x 2.5m',
    featured: false
  },
  {
    id: 'extension-4',
    title: 'Family Living Extension',
    location: 'Meath, Ireland',
    images: ['/images/projects/extension-4.jpg'],
    tags: ['Extension', 'Living', 'Open-Plan'],
    description: 'Large open-plan extension creating spacious family living area',
    category: 'extension',
    completedDate: '2023-08-30',
    size: '10m x 6m',
    featured: true
  }
];

/**
 * GET /api/projects
 * Returns a list of completed projects with optional filtering
 * 
 * Query parameters:
 * - category: 'garden-room' | 'extension' - Filter by project category
 * - featured: 'true' | 'false' - Filter by featured status
 * - limit: number - Limit number of results (default: 20, max: 50)
 * - offset: number - Offset for pagination (default: 0)
 * - tags: string - Comma-separated list of tags to filter by
 */
router.get('/projects', async (req: Request, res: Response) => {
  try {
    const {
      category,
      featured,
      limit = '20',
      offset = '0',
      tags
    } = req.query;

    // Parse and validate query parameters
    const parsedLimit = Math.min(parseInt(limit as string) || 20, 50);
    const parsedOffset = Math.max(parseInt(offset as string) || 0, 0);

    // Start with all projects
    let filteredProjects = [...staticProjects];

    // Apply category filter
    if (category && typeof category === 'string') {
      if (category === 'garden-room' || category === 'extension') {
        filteredProjects = filteredProjects.filter(project => project.category === category);
      }
    }

    // Apply featured filter
    if (featured && typeof featured === 'string') {
      const isFeatured = featured.toLowerCase() === 'true';
      filteredProjects = filteredProjects.filter(project => project.featured === isFeatured);
    }

    // Apply tags filter
    if (tags && typeof tags === 'string') {
      const tagList = tags.split(',').map(tag => tag.trim().toLowerCase());
      filteredProjects = filteredProjects.filter(project => 
        project.tags.some(projectTag => 
          tagList.includes(projectTag.toLowerCase())
        )
      );
    }

    // Sort by completion date (most recent first)
    filteredProjects.sort((a, b) => {
      const dateA = new Date(a.completedDate || '1970-01-01');
      const dateB = new Date(b.completedDate || '1970-01-01');
      return dateB.getTime() - dateA.getTime();
    });

    // Apply pagination
    const paginatedProjects = filteredProjects.slice(parsedOffset, parsedOffset + parsedLimit);

    // Prepare response
    const response = {
      success: true,
      data: paginatedProjects,
      meta: {
        total: filteredProjects.length,
        limit: parsedLimit,
        offset: parsedOffset,
        hasMore: parsedOffset + parsedLimit < filteredProjects.length
      }
    };

    // Set cache headers for performance
    res.set({
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'Content-Type': 'application/json'
    });

    return res.status(200).json(response);

  } catch (error) {
    console.error('Projects API error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching projects. Please try again.',
      data: []
    });
  }
});

/**
 * GET /api/projects/:id
 * Returns detailed information for a specific project
 */
router.get('/projects/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Project ID is required',
        data: null
      });
    }

    // Find the project
    const project = staticProjects.find(p => p.id === id);

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found',
        data: null
      });
    }

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=600', // 10 minutes
      'Content-Type': 'application/json'
    });

    return res.status(200).json({
      success: true,
      data: project
    });

  } catch (error) {
    console.error('Project detail API error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching project details. Please try again.',
      data: null
    });
  }
});

/**
 * GET /api/projects/categories
 * Returns available project categories and their counts
 */
router.get('/projects/categories', async (req: Request, res: Response) => {
  try {
    // Count projects by category
    const categories = staticProjects.reduce((acc, project) => {
      const category = project.category || 'other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=3600', // 1 hour
      'Content-Type': 'application/json'
    });

    return res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Project categories API error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching project categories. Please try again.',
      data: {}
    });
  }
});

/**
 * GET /api/projects/tags
 * Returns all available tags used in projects
 */
router.get('/projects/tags', async (req: Request, res: Response) => {
  try {
    // Collect all unique tags
    const allTags = staticProjects.reduce((acc, project) => {
      project.tags.forEach(tag => acc.add(tag));
      return acc;
    }, new Set<string>());

    const tags = Array.from(allTags).sort();

    // Set cache headers
    res.set({
      'Cache-Control': 'public, max-age=3600', // 1 hour
      'Content-Type': 'application/json'
    });

    return res.status(200).json({
      success: true,
      data: tags
    });

  } catch (error) {
    console.error('Project tags API error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while fetching project tags. Please try again.',
      data: []
    });
  }
});

export { router as projectsRouter };
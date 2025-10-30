/**
 * Gallery Component
 * 
 * User Story 3: Explore Projects Gallery
 * A responsive, accessible gallery container with scroll-snap behavior,
 * keyboard navigation, and progressive enhancement for drag interactions.
 * 
 * Features:
 * - Fixed height container with horizontal scroll
 * - Scroll-snap alignment for smooth navigation
 * - Keyboard accessible with arrow key support  
 * - Variable-height tiles with lazy loading
 * - Reduced motion support
 * - Static-first with optional API enhancement
 */

interface ProjectData {
  id: string;
  title: string;
  location: string;
  images: string[];
  tags: string[];
  description?: string;
}

class Gallery {
  private container: HTMLElement | null = null;
  private tilesContainer: HTMLElement | null = null;
  private prevButton: HTMLButtonElement | null = null;
  private nextButton: HTMLButtonElement | null = null;
  private liveRegion: HTMLElement | null = null;
  private isDragging: boolean = false;
  private startX: number = 0;
  private scrollLeft: number = 0;
  private projects: ProjectData[] = [];

  constructor() {
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    this.handleMouseUp = this.handleMouseUp.bind(this);
    this.handlePrevClick = this.handlePrevClick.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);
  }

  mount(targetElement: HTMLElement): void {
    if (!targetElement) {
      console.warn('Gallery: No target element provided for mounting');
      return;
    }

    // Find existing gallery section and replace its content
    const existingGallery = document.querySelector('#gallery');
    if (existingGallery) {
      // Clear existing content and replace with our gallery
      existingGallery.innerHTML = '';
      existingGallery.className = 'gallery';
      existingGallery.setAttribute('data-testid', 'gallery-container');
      existingGallery.setAttribute('role', 'region');
      existingGallery.setAttribute('aria-labelledby', 'gallery-heading');
      
      // Create gallery content
      this.container = existingGallery as HTMLElement;
      this.createGalleryContent();
    } else {
      // Fallback: create new gallery and append to target
      this.container = this.createElement();
      targetElement.appendChild(this.container);
    }
    
    this.bindEvents();
    this.updateNavigation();
    this.loadProjects();
  }

  private createGalleryContent(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="gallery-header">
        <h2 id="gallery-heading" class="gallery-title">Our Recent Projects</h2>
        <div class="gallery-controls">
          <button type="button" class="gallery-nav-btn gallery-nav-prev" data-testid="gallery-prev" aria-label="View previous projects">
            <span class="gallery-nav-icon" aria-hidden="true">‹</span>
            <span class="sr-only">Previous</span>
          </button>
          <button type="button" class="gallery-nav-btn gallery-nav-next" data-testid="gallery-next" aria-label="View next projects">
            <span class="gallery-nav-icon" aria-hidden="true">›</span>
            <span class="sr-only">Next</span>
          </button>
        </div>
      </div>
      
      <div class="gallery-container" tabindex="0" role="group" aria-label="Project gallery">
        <div class="gallery-tiles" data-testid="gallery-tiles">
          <!-- Project tiles will be inserted here -->
        </div>
      </div>
      
      <div class="gallery-live-region" data-testid="gallery-live-region" aria-live="polite" aria-atomic="true"></div>
    `;

    // Cache DOM references
    this.tilesContainer = this.container.querySelector('.gallery-tiles');
    this.prevButton = this.container.querySelector('.gallery-nav-prev') as HTMLButtonElement;
    this.nextButton = this.container.querySelector('.gallery-nav-next') as HTMLButtonElement;
    this.liveRegion = this.container.querySelector('.gallery-live-region');
  }

  private createElement(): HTMLElement {
    const gallery = document.createElement('section');
    gallery.className = 'gallery';
    gallery.setAttribute('data-testid', 'gallery-container');
    gallery.setAttribute('role', 'region');
    gallery.setAttribute('aria-labelledby', 'gallery-heading');

    // Use the createGalleryContent method to populate
    this.container = gallery;
    this.createGalleryContent();

    return gallery;
  }

  private bindEvents(): void {
    if (!this.container) return;

    const galleryContainer = this.container.querySelector('.gallery-container') as HTMLElement;
    
    // Keyboard navigation
    galleryContainer?.addEventListener('keydown', this.handleKeyDown);
    
    // Scroll events for navigation state
    galleryContainer?.addEventListener('scroll', this.handleScroll);
    
    // Mouse drag events (progressive enhancement)
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      galleryContainer?.addEventListener('mousedown', this.handleMouseDown);
      galleryContainer?.addEventListener('mousemove', this.handleMouseMove);
      galleryContainer?.addEventListener('mouseup', this.handleMouseUp);
      galleryContainer?.addEventListener('mouseleave', this.handleMouseUp);
    }
    
    // Navigation buttons
    this.prevButton?.addEventListener('click', this.handlePrevClick);
    this.nextButton?.addEventListener('click', this.handleNextClick);
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const galleryContainer = this.container?.querySelector('.gallery-container') as HTMLElement;
    if (!galleryContainer) return;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        this.scrollToPrevious();
        break;
      case 'ArrowRight':
        event.preventDefault();
        this.scrollToNext();
        break;
      case 'Home':
        event.preventDefault();
        galleryContainer.scrollLeft = 0;
        this.announceNavigation('Moved to first project');
        break;
      case 'End':
        event.preventDefault();
        galleryContainer.scrollLeft = galleryContainer.scrollWidth - galleryContainer.clientWidth;
        this.announceNavigation('Moved to last project');
        break;
    }
  }

  private handleScroll(): void {
    this.updateNavigation();
  }

  private handleMouseDown(event: MouseEvent): void {
    const galleryContainer = this.container?.querySelector('.gallery-container') as HTMLElement;
    if (!galleryContainer) return;

    this.isDragging = true;
    this.startX = event.pageX - galleryContainer.offsetLeft;
    this.scrollLeft = galleryContainer.scrollLeft;
    galleryContainer.style.cursor = 'grabbing';
    galleryContainer.style.userSelect = 'none';
  }

  private handleMouseMove(event: MouseEvent): void {
    if (!this.isDragging) return;
    
    const galleryContainer = this.container?.querySelector('.gallery-container') as HTMLElement;
    if (!galleryContainer) return;

    event.preventDefault();
    const x = event.pageX - galleryContainer.offsetLeft;
    const walk = (x - this.startX) * 2; // Scroll speed multiplier
    galleryContainer.scrollLeft = this.scrollLeft - walk;
  }

  private handleMouseUp(): void {
    if (!this.isDragging) return;
    
    this.isDragging = false;
    const galleryContainer = this.container?.querySelector('.gallery-container') as HTMLElement;
    if (galleryContainer) {
      galleryContainer.style.cursor = 'grab';
      galleryContainer.style.userSelect = '';
    }
  }

  private handlePrevClick(): void {
    this.scrollToPrevious();
  }

  private handleNextClick(): void {
    this.scrollToNext();
  }

  private scrollToPrevious(): void {
    const galleryContainer = this.container?.querySelector('.gallery-container') as HTMLElement;
    if (!galleryContainer) return;

    const scrollAmount = galleryContainer.clientWidth * 0.8;
    galleryContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    this.announceNavigation('Moved to previous projects');
  }

  private scrollToNext(): void {
    const galleryContainer = this.container?.querySelector('.gallery-container') as HTMLElement;
    if (!galleryContainer) return;

    const scrollAmount = galleryContainer.clientWidth * 0.8;
    galleryContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    this.announceNavigation('Moved to next projects');
  }

  private updateNavigation(): void {
    const galleryContainer = this.container?.querySelector('.gallery-container') as HTMLElement;
    if (!galleryContainer || !this.prevButton || !this.nextButton) return;

    const isAtStart = galleryContainer.scrollLeft <= 0;
    const isAtEnd = galleryContainer.scrollLeft >= 
      galleryContainer.scrollWidth - galleryContainer.clientWidth - 1;

    // Update button states
    this.prevButton.disabled = isAtStart;
    this.prevButton.setAttribute('aria-disabled', isAtStart.toString());

    this.nextButton.disabled = isAtEnd;
    this.nextButton.setAttribute('aria-disabled', isAtEnd.toString());
  }

  private announceNavigation(message: string): void {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
      // Clear after announcement
      setTimeout(() => {
        if (this.liveRegion) this.liveRegion.textContent = '';
      }, 1000);
    }
  }

  private loadProjects(): void {
    // Start with static project data
    this.projects = this.getStaticProjects();
    this.renderTiles();
    
    // Optional: Try to load from API (progressive enhancement)
    this.loadProjectsFromAPI().catch(() => {
      // Silently fail back to static data
      console.log('Gallery: Using static project data (API unavailable)');
    });
  }

  private getStaticProjects(): ProjectData[] {
    // SVG placeholder for missing images
    const placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzRhNTU2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkdhcmRlbiBSb29tPC90ZXh0Pjwvc3ZnPg==';
    
    return [
      {
        id: 'garden-room-1',
        title: 'Modern Garden Office',
        location: 'Dublin, Ireland',
        images: [placeholder],
        tags: ['Garden Room', 'Office', 'Modern'],
        description: 'Contemporary garden office with floor-to-ceiling windows and sustainable materials'
      },
      {
        id: 'extension-1',
        title: 'Kitchen Extension',
        location: 'Cork, Ireland',
        images: [placeholder],
        tags: ['Extension', 'Kitchen', 'Family'],
        description: 'Open-plan kitchen extension with bifold doors to garden'
      },
      {
        id: 'garden-room-2',
        title: 'Garden Studio',
        location: 'Galway, Ireland',
        images: [placeholder],
        tags: ['Garden Room', 'Studio', 'Creative'],
        description: 'Versatile garden studio perfect for creative work and relaxation'
      },
      {
        id: 'extension-2',
        title: 'Two-Storey Extension',
        location: 'Limerick, Ireland',
        images: [placeholder],
        tags: ['Extension', 'Two-Storey', 'Family'],
        description: 'Spacious two-storey extension adding bedroom and living space'
      },
      {
        id: 'garden-room-3',
        title: 'Eco Garden Pod',
        location: 'Waterford, Ireland',
        images: [placeholder],
        tags: ['Garden Room', 'Eco', 'Sustainable'],
        description: 'Eco-friendly garden pod with green roof and solar panels'
      },
      {
        id: 'extension-3',
        title: 'Victorian Extension',
        location: 'Dublin, Ireland',
        images: [placeholder],
        tags: ['Extension', 'Victorian', 'Heritage'],
        description: 'Sympathetic extension to Victorian terrace house'
      }
    ];
  }

  private async loadProjectsFromAPI(): Promise<void> {
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const apiProjects: ProjectData[] = await response.json();
        this.projects = apiProjects;
        this.renderTiles();
      }
    } catch (error) {
      // API not available, keep static data
      throw error;
    }
  }

  private renderTiles(): void {
    if (!this.tilesContainer) return;

    this.tilesContainer.innerHTML = '';

    this.projects.forEach((project) => {
      const tile = this.createProjectTile(project);
      this.tilesContainer!.appendChild(tile);
    });

    // Update navigation after rendering
    setTimeout(() => this.updateNavigation(), 100);
  }

  private createProjectTile(project: ProjectData): HTMLElement {
    const tile = document.createElement('article');
    tile.className = 'gallery-tile';
    tile.setAttribute('data-testid', 'project-tile');
    tile.setAttribute('tabindex', '0');
    tile.setAttribute('role', 'button');
    tile.setAttribute('aria-label', `${project.title} in ${project.location}`);
    tile.setAttribute('aria-describedby', `project-desc-${project.id}`);

    const imageUrl = project.images[0] || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzRhNTU2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg==';
    
    tile.innerHTML = `
      <div class="gallery-tile-image">
        <img 
          src="${imageUrl}" 
          alt="${project.title} - ${project.description || 'Project view'}"
          loading="lazy"
          width="400"
          height="300"
          onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTJlOGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzRhNTU2OCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=='; this.onerror=null;"
        >
        <div class="gallery-tile-overlay">
          <div class="gallery-tile-tags">
            ${project.tags.map(tag => `<span class="gallery-tag">${tag}</span>`).join('')}
          </div>
        </div>
      </div>
      
      <div class="gallery-tile-content">
        <h3 class="gallery-tile-title">${project.title}</h3>
        <p class="gallery-tile-location">${project.location}</p>
        <p class="gallery-tile-description" id="project-desc-${project.id}">
          ${project.description || 'View project details'}
        </p>
      </div>
    `;

    // Add interaction handlers
    tile.addEventListener('click', () => this.handleTileClick(project));
    tile.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        this.handleTileClick(project);
      }
    });

    return tile;
  }

  private handleTileClick(project: ProjectData): void {
    // For now, just announce the selection
    this.announceNavigation(`Selected ${project.title} in ${project.location}`);
    
    // Future: Could open modal, navigate to detail page, etc.
    console.log('Project selected:', project);
  }

  // Public API for external integration
  public scrollToProject(projectId: string): void {
    const index = this.projects.findIndex(p => p.id === projectId);
    if (index === -1) return;

    const galleryContainer = this.container?.querySelector('.gallery-container') as HTMLElement;
    const tiles = this.container?.querySelectorAll('.gallery-tile');
    
    if (galleryContainer && tiles && tiles[index]) {
      const tile = tiles[index] as HTMLElement;
      const scrollLeft = tile.offsetLeft - (galleryContainer.clientWidth - tile.offsetWidth) / 2;
      galleryContainer.scrollTo({ left: scrollLeft, behavior: 'smooth' });
      
      // Focus the tile
      setTimeout(() => {
        (tile as HTMLElement).focus();
      }, 300);
    }
  }

  public getVisibleProjects(): ProjectData[] {
    const galleryContainer = this.container?.querySelector('.gallery-container') as HTMLElement;
    if (!galleryContainer) return [];

    const containerRect = galleryContainer.getBoundingClientRect();
    const tiles = this.container?.querySelectorAll('.gallery-tile') || [];
    const visibleProjects: ProjectData[] = [];

    tiles.forEach((tile, index) => {
      const tileRect = tile.getBoundingClientRect();
      const isVisible = tileRect.left < containerRect.right && tileRect.right > containerRect.left;
      
      if (isVisible && this.projects[index]) {
        visibleProjects.push(this.projects[index]);
      }
    });

    return visibleProjects;
  }
}

export default Gallery;
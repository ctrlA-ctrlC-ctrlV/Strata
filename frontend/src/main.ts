// Import Tailwind CSS
import './styles/tailwind.css'

// Import the home page component
import HomePage from './pages/home'

// Main TypeScript entry point
console.log('Strata Garden Rooms - Frontend Loaded')

// Initialize the application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('DOM Content Loaded')
  
  try {
    // Initialize the home page
    const homePage = new HomePage({
      enableJavaScriptEnhancements: true,
      lazyLoadComponents: false
    })
    
    await homePage.initialize()
    console.log('Home page initialized successfully')
  } catch (error) {
    console.error('Failed to initialize home page:', error)
    // Fallback initialization
    initializeFallback()
  }
})

function initializeFallback(): void {
  console.log('Using fallback initialization')
  
  // Basic navigation functionality
  initializeNavigation()
  initializeAccessibility()
  
  // Basic smooth scrolling for anchor links
  document.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    const link = target.closest('a[href^="#"]') as HTMLAnchorElement
    
    if (link && link.getAttribute('href')?.startsWith('#')) {
      e.preventDefault()
      const targetId = link.getAttribute('href')
      const targetElement = document.querySelector(targetId!)
      
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        })
      }
    }
  })
}

function initializeNavigation(): void {
  // Add active state to current page
  const currentPath: string = window.location.pathname
  const navLinks: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('nav a')
  
  navLinks.forEach((link: HTMLAnchorElement) => {
    if (link.getAttribute('href') === currentPath) {
      link.setAttribute('aria-current', 'page')
      link.style.backgroundColor = '#e5e7eb'
    }
  })
}

function initializeAccessibility(): void {
  // Add skip link functionality
  const skipLink: HTMLElement | null = document.querySelector('.skip-link')
  if (skipLink) {
    skipLink.addEventListener('click', (e: Event) => {
      e.preventDefault()
      const target: HTMLElement | null = document.querySelector('#main, #main-content')
      if (target) {
        target.focus()
        target.scrollIntoView()
      }
    })
  }
}
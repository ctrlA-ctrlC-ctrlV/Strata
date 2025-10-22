// Main TypeScript entry point
console.log('Strata Garden Rooms - Frontend Loaded')

// Basic initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded')
  
  // Add any global event listeners or initialization here
  initializeNavigation()
  initializeAccessibility()
})

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
      const target: HTMLElement | null = document.querySelector('#main-content')
      if (target) {
        target.focus()
        target.scrollIntoView()
      }
    })
  }
}
// Main JavaScript entry point
console.log('Strata Garden Rooms - Frontend Loaded')

// Basic initialization
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM Content Loaded')
  
  // Add any global event listeners or initialization here
  initializeNavigation()
  initializeAccessibility()
})

function initializeNavigation() {
  // Add active state to current page
  const currentPath = window.location.pathname
  const navLinks = document.querySelectorAll('nav a')
  
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.setAttribute('aria-current', 'page')
      link.style.backgroundColor = '#e5e7eb'
    }
  })
}

function initializeAccessibility() {
  // Add skip link functionality
  const skipLink = document.querySelector('.skip-link')
  if (skipLink) {
    skipLink.addEventListener('click', (e) => {
      e.preventDefault()
      const target = document.querySelector('#main-content')
      if (target) {
        target.focus()
        target.scrollIntoView()
      }
    })
  }
}
// Utilitaires pour les animations et effets visuels

export const setupScrollAnimations = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible')
        observer.unobserve(entry.target)
      }
    })
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  })

  // Observer tous les éléments avec la classe animate-on-scroll
  document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el)
  })

  return () => observer.disconnect()
}

export const setupNavbarScroll = () => {
  const navbar = document.querySelector('.navbar')
  
  const handleScroll = () => {
    if (window.scrollY > 100) {
      navbar?.classList.add('navbar-scrolled')
    } else {
      navbar?.classList.remove('navbar-scrolled')
    }
  }

  window.addEventListener('scroll', handleScroll)
  
  return () => window.removeEventListener('scroll', handleScroll)
}

export const addHoverEffects = () => {
  // Ajouter des effets de survol dynamiques
  const cards = document.querySelectorAll('.location-card')
  
  cards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      card.classList.add('animate-pulse')
    })
    
    card.addEventListener('mouseleave', () => {
      card.classList.remove('animate-pulse')
    })
  })
}

// Fonction pour initialiser toutes les animations
export const initializeAnimations = () => {
  // Attendre que le DOM soit chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setupScrollAnimations()
      setupNavbarScroll()
      addHoverEffects()
    })
  } else {
    setupScrollAnimations()
    setupNavbarScroll()
    addHoverEffects()
  }
}

// Fonction pour animer l'apparition des statistiques
export const animateStats = (stats: { total: number; monuments: number; nature: number; regions: number }) => {
  const animateNumber = (element: HTMLElement, target: number, duration: number = 1000) => {
    const start = 0
    const startTime = performance.now()
    
    const updateNumber = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      const current = Math.floor(start + (target - start) * progress)
      element.textContent = current.toString()
      
      if (progress < 1) {
        requestAnimationFrame(updateNumber)
      }
    }
    
    requestAnimationFrame(updateNumber)
  }
  
  // Animer chaque statistique
  setTimeout(() => {
    const totalEl = document.querySelector('[data-stat="total"]')
    const monumentsEl = document.querySelector('[data-stat="monuments"]')
    const natureEl = document.querySelector('[data-stat="nature"]')
    const regionsEl = document.querySelector('[data-stat="regions"]')
    
    if (totalEl) animateNumber(totalEl as HTMLElement, stats.total)
    if (monumentsEl) animateNumber(monumentsEl as HTMLElement, stats.monuments, 1200)
    if (natureEl) animateNumber(natureEl as HTMLElement, stats.nature, 1400)
    if (regionsEl) animateNumber(regionsEl as HTMLElement, stats.regions, 1600)
  }, 500)
}
// ===== Persistent Dark/Light Mode Toggle =====
function initializeTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Set initial theme from localStorage or default to dark
  const savedTheme = localStorage.getItem('theme') || 'dark';
  document.body.dataset.theme = savedTheme;
  
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.body.dataset.theme;
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      // Update current page
      document.body.dataset.theme = newTheme;
      
      // Save to localStorage for other pages
      localStorage.setItem('theme', newTheme);
    });
  }
}

// ===== Scroll Animations =====
function initializeAnimations() {
  const animatedElements = document.querySelectorAll('.course-card, .lesson-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  animatedElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s, transform 0.5s';
    observer.observe(el);
  });
}

// Initialize everything when page loads
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  initializeAnimations();
});
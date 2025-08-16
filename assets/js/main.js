// Dark/Light Mode Toggle
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  const currentTheme = document.body.dataset.theme;
  document.body.dataset.theme = currentTheme === "dark" ? "light" : "dark";
});

// Animate Course Cards on Scroll
const courseCards = document.querySelectorAll(".course-card");

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = "1";
      entry.target.style.transform = "translateY(0)";
    }
  });
}, { threshold: 0.1 });

courseCards.forEach(card => {
  card.style.opacity = "0";
  card.style.transform = "translateY(20px)";
  card.style.transition = "opacity 0.5s, transform 0.5s";
  observer.observe(card);
});
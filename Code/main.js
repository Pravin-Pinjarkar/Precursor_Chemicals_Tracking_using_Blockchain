/* 🔄 Image Slider */
let index = 0;
function showSlide() {
  const slides = document.querySelectorAll(".slides");
  slides.forEach(s => (s.style.display = "none"));
  index = (index + 1) % slides.length;
  slides[index].style.display = "block";
}
showSlide();
setInterval(showSlide, 4000);

/* ✨ Lighting effect following cursor */
document.addEventListener("mousemove", (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  document.body.style.background = `radial-gradient(circle at ${x}% ${y}%, #ffffff, #e7ecff, #dfe6ff)`;
});

/* 🌟 Glow pulse on every clickable button */
document.querySelectorAll("a").forEach(btn => {
  btn.addEventListener("mouseover", () => {
    btn.style.filter = "brightness(1.15)";
  });
  btn.addEventListener("mouseout", () => {
    btn.style.filter = "brightness(1)";
  });
});

/* 💥 Click ripple effect on feature cards */
document.querySelectorAll(".feature-card").forEach(card => {
  card.addEventListener("click", (e) => {
    const ripple = document.createElement("span");
    ripple.classList.add("ripple");
    ripple.style.left = e.offsetX + "px";
    ripple.style.top = e.offsetY + "px";
    card.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
});

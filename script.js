const cartCount = document.querySelector("#cart-count");
const addButtons = document.querySelectorAll(".product-info button");
const filters = document.querySelectorAll(".filter");
const productCards = document.querySelectorAll(".product-card");
const heroPanel = document.querySelector(".hero-panel");
const crystalCursor = document.querySelector(".crystal-cursor");

let cartItems = 0;
let lastSpark = 0;

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cartItems += 1;
    cartCount.textContent = cartItems;
    button.textContent = "Added";

    window.setTimeout(() => {
      button.textContent = button.dataset.name.includes("Moonstone")
        ? "$68 Add"
        : button.dataset.name.includes("Quartz")
          ? "$55 Add"
          : button.dataset.name.includes("Citrine")
            ? "$36 Add"
            : "$42 Add";
    }, 900);
  });
});

if (heroPanel) {
  heroPanel.addEventListener("pointermove", (event) => {
    const bounds = heroPanel.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 10;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * -10;

    heroPanel.style.transform = `perspective(900px) rotateY(${x}deg) rotateX(${y}deg)`;
  });

  heroPanel.addEventListener("pointerleave", () => {
    heroPanel.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg)";
  });
}

if (crystalCursor && window.matchMedia("(pointer: fine)").matches) {
  window.addEventListener("pointermove", (event) => {
    crystalCursor.style.transform = `translate3d(${event.clientX - 7}px, ${event.clientY - 8}px, 0) rotate(-16deg)`;

    const now = Date.now();
    if (now - lastSpark > 55) {
      lastSpark = now;
      const spark = document.createElement("span");
      spark.className = "cursor-spark";
      spark.style.left = `${event.clientX - 10 + Math.random() * 18}px`;
      spark.style.top = `${event.clientY + 8 + Math.random() * 18}px`;
      document.body.appendChild(spark);
      window.setTimeout(() => spark.remove(), 700);
    }
  });

  document.querySelectorAll("a, button, input, select, textarea").forEach((item) => {
    item.addEventListener("pointerenter", () => crystalCursor.classList.add("is-hovering"));
    item.addEventListener("pointerleave", () => crystalCursor.classList.remove("is-hovering"));
  });
}

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const activeFilter = filter.dataset.filter;

    filters.forEach((item) => item.classList.remove("active"));
    filter.classList.add("active");

    productCards.forEach((card) => {
      const isVisible = activeFilter === "all" || card.dataset.category === activeFilter;
      card.hidden = !isVisible;
    });
  });
});

const cartCount = document.querySelector("#cart-count");
const addButtons = document.querySelectorAll(".product-info button");
const filters = document.querySelectorAll(".filter");
const productCards = document.querySelectorAll(".product-card");
const heroPanel = document.querySelector(".hero-panel");
const crystalCursor = document.querySelector(".crystal-cursor");
const aiResponse = document.querySelector("#ai-response");
const oracleButtons = document.querySelectorAll("[data-match]");
const revealItems = document.querySelectorAll("[data-reveal]");

let cartItems = 0;
let lastSpark = 0;

const crystalMatches = {
  calm: "Today’s match: amethyst tower for calm energy, deep color, and nightstand glow.",
  love: "Today’s match: rose quartz palm stone for soft color, warm gifting, and heart-led custom sets.",
  focus: "Today’s match: clear quartz pendant for clean light, daily wear, and intention stacking.",
  protect: "Today’s match: smoky quartz collector point for grounding, depth, and rare display drama.",
};

addButtons.forEach((button) => {
  button.addEventListener("click", () => {
    cartItems += 1;
    cartCount.textContent = cartItems;
    button.textContent = "Added";
    burstFromButton(button);

    window.setTimeout(() => {
      button.textContent = button.dataset.price;
    }, 900);
  });
});

oracleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    oracleButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    aiResponse.textContent = crystalMatches[button.dataset.match];
  });
});

if (revealItems.length > 0) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 },
  );

  revealItems.forEach((item, index) => {
    item.style.setProperty("--reveal-delay", `${Math.min(index * 70, 280)}ms`);
    observer.observe(item);
  });
}

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

function burstFromButton(button) {
  const bounds = button.getBoundingClientRect();

  for (let index = 0; index < 10; index += 1) {
    const spark = document.createElement("span");
    spark.className = "cart-burst";
    spark.style.left = `${bounds.left + bounds.width / 2}px`;
    spark.style.top = `${bounds.top + bounds.height / 2}px`;
    spark.style.setProperty("--burst-x", `${(Math.random() - 0.5) * 110}px`);
    spark.style.setProperty("--burst-y", `${(Math.random() - 0.5) * 90}px`);
    document.body.appendChild(spark);
    window.setTimeout(() => spark.remove(), 650);
  }
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

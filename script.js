const cartCount = document.querySelector("#cart-count");
const addButtons = document.querySelectorAll(".product-info button");
const filters = document.querySelectorAll(".filter");
const productCards = document.querySelectorAll(".product-card");
const heroPanel = document.querySelector(".hero-panel");

let cartItems = 0;

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

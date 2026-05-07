const cartCount = document.querySelector("#cart-count");
const addButtons = document.querySelectorAll(".product-info button");
const filters = document.querySelectorAll(".filter");
const productCards = document.querySelectorAll(".product-card");

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

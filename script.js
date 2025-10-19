$(document).ready(function () {

  //Jquery Syntax for the selectors
  const $grid = $("#productGrid");
  const $filterButtons = $(".filter-btn");
  const $sortSelect = $("#sort");

  // Load products from external JSON file
  $.getJSON("products.json", function (products) {

    function displayProducts(items) {
      const html = items.map(p => `
        <div class="product-card" data-category="${p.category}" data-price="${p.price}">
          <img src="${p.img}" alt="${p.name}">
          <div class="product-info">
            <h2>${p.name}</h2>
            <p>${p.desc}</p>
            <div class="price">$${p.price.toFixed(2)}</div>
            <a href="#" class="product-btn">Add to Cart</a>
          </div>
        </div>
      `).join("");
      $grid.html(html);
      console.log("Loaded products:", products);

    }

    function filterProducts(category) {
      let filtered = category === "all" ? products : products.filter(p => p.category === category);
      const sortValue = $sortSelect.val();
      if (sortValue === "asc") filtered.sort((a, b) => a.price - b.price);
      if (sortValue === "desc") filtered.sort((a, b) => b.price - a.price);
      displayProducts(filtered);
    }

    // Event listeners
    $filterButtons.on("click", function () {
      $(".filter-btn.active").removeClass("active");
      $(this).addClass("active");
      const category = $(this).data("category");
      filterProducts(category);
    });

    $sortSelect.on("change", function () {
      const activeCategory = $(".filter-btn.active").data("category") || "all";
      filterProducts(activeCategory);
    });

    // Initial display
    displayProducts(products);
  }).fail(function () {
    console.error("Error loading products.json");
  });
});
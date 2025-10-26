$(document).ready(function () {
	
  //Jquery Syntax for the selectors
  const $grid = $("#productGrid");
  const $filterButtons = $(".filter-btn");
  const $sortSelect = $("#sort");
	
  let cart = {};
	
  function addToCart(product) {
        if (cart[product.ProductID]) {
            cart[product.ProductID].quantity += 1;
        } else {
            cart[product.ProductID] = { ...product, quantity: 1 };
        }
        console.log("Cart:", cart);
  }
	
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
            <a href="#" class="product-btn" data-id="${p.ProductID}">Add to Cart</a>
          </div>
        </div>
      `).join("");
      $grid.html(html);
      console.log("Loaded products:", products);
		
		$(".product-btn").on("click", function (e) {
                e.preventDefault();
                const id = $(this).data("id");
                const product = products.find(p => p.ProductID === id);
                addToCart(product);
            });

    }

    function filterProducts(category, query = "") {
		let filtered = category === "all" ? products : products.filter(p => p.category === category);
		
		if (query) {
			filtered = filtered.filter(p =>
			   p.name.toLowerCase().includes(query) || p.desc.toLowerCase().includes(query) ||
			   (p.Tags && p.Tags.some(tag => tag.toLowerCase().includes(query)))
			);
		}
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
	  const query = $("#searchInput").val().trim().toLowerCase();
      filterProducts(category, query);
    });

    $sortSelect.on("change", function () {
      const activeCategory = $(".filter-btn.active").data("category") || "all";
	  const query = $("#searchInput").val().trim().toLowerCase();
      filterProducts(activeCategory, query);
    });
	  
    $(".filter-btn[data-category='all']").addClass("active");

  	$("#searchBtn").on("click", function () {
		const query = $("#searchInput").val().trim().toLowerCase();
		const category = $(".filter-btn.active").data("category") || "all";
		filterProducts(category, query);
	});
	  
  	$("#searchInput").on("keyup", function () {
		const query = $(this).val().trim().toLowerCase();
		const category = $(".filter-btn.active").data("category") || "all";
		filterProducts(category, query);
	});


    // Initial display
    displayProducts(products);
  }).fail(function () {
    console.error("Error loading products.json");
  });
});
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
  
// --- CART FUNCTIONALITY --- /

    // Retrieve saved cart or initialize empty
    cart = JSON.parse(localStorage.getItem("cart")) || {};

    // Function to update cart in localStorage
    function saveCart() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    // Function to render cart items
    function renderCart() {
        if (!$("#cart-items").length) return; // Only run on cart page

        let html = "";
        let total = 0;

        $.each(cart, function (id, item) {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            html += `
            <div class="cart-item d-flex justify-content-between align-items-center border-bottom py-3">
                <div class="d-flex align-items-center">
                    <img src="${item.img}" alt="${item.name}" width="100" height="100" class="rounded me-3">
                    <div>
                        <h5 style="font-size: 2rem;">${item.name}</h5>
                        <p class="text-muted" style="font-size: 1.5rem;">$${item.price} each</p>
                    </div>
                </div>
                <div class="d-flex align-items-center">
                    <input type="number" min="1" value="${item.quantity}" data-id="${id}" class="form-control form-control-sm quantity-input me-3" style="width:60px; font-size: 1.5rem;">
                    <p class="fw-bold mb-0 me-3 " style="font-size: 1.8rem;">$${itemTotal.toFixed(2)}</p>
                    <button style="font-size: 1rem;" class="btn btn-danger btn-sm remove-item" data-id="${id}">Remove</button>
                </div>
            </div>`;
        });

        if (Object.keys(cart).length === 0) {
            html = `<p class="text-center mt-4" style= "font-size: 2rem;">Your cart is empty.</p>`;
        }

        $("#cart-items").html(html);
        $("#cart-total").text(total.toFixed(2));
    }

    // Listen for quantity changes
    $(document).on("change", ".quantity-input", function () {
        const id = $(this).data("id");
        const qty = parseInt($(this).val());
        if (qty > 0) {
            cart[id].quantity = qty;
            saveCart();
            renderCart();
        }
    });

    // Remove item
    $(document).on("click", ".remove-item", function () {
        const id = $(this).data("id");
        delete cart[id];
        saveCart();
        renderCart();
    });

    // Checkout
    $("#checkout-btn").on("click", function () {
        open("./shipping.html")
    });

    // Custom alert to confirm when item is added to the cart
    function shopSweetAlert() {
            // Hide the default alert
            window.alert = function () { };

            // Use SweetAlert to display an alert
            Swal.fire({
                title: 'Item Added!',
                text: 'Item Has Been Added To Your Cart',
                icon: 'success',
                iconColor: '#e3b23c',
                confirmButtonText: 'OK',
                confirmButtonColor: '#e3b23c'
            });
        }

    // AJAX ADD-TO-CART from shop page
    $(document).on("click", ".product-btn", function (e) {
        e.preventDefault();
        const productId = $(this).data("id");

        $.getJSON("products.json", function (products) {
            const product = products.find(p => p.ProductID === productId);
            if (cart[productId]) {
                cart[productId].quantity + 1;
            } else {
                cart[productId] = { ...product, quantity: 1 };
            }
            saveCart();
            shopSweetAlert();
        });
    });

    console.log("Cart data:", cart);

    // Render cart on page load if on cart page
    renderCart();
});




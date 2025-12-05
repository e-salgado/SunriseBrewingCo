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

// ------------------- CART MANAGER -------------------
cart = JSON.parse(localStorage.getItem("cart")) || {};

function saveCart() {
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(product) {
    if (cart[product.ProductID]) {
        cart[product.ProductID].quantity += 1;
    } else {
        cart[product.ProductID] = {
            ...product,
            quantity: 1
        };
    }
    saveCart();
}

function fixBadCartData() {
    let changed = false;
    Object.values(cart).forEach(item => {
        if (!item.quantity || isNaN(item.quantity)) {
            item.quantity = 1;
            changed = true;
        }
    });
    if (changed) saveCart();
}

fixBadCartData();
// -----------------------------------------------------

$(document).ready(function () {

    // Render cart items
    function renderCart() {
        if (!$("#cart-items").length) return;

        let html = "";
        let total = 0;

        $.each(cart, function (id, item) {

            if (!item.quantity || item.quantity < 1) {
                item.quantity = 1;
                saveCart();
            }

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
            html = `<p class="text-center mt-4" style="font-size: 2rem;">Your cart is empty.</p>`;
        }

        $("#cart-items").html(html);
        $("#cart-total").text(total.toFixed(2));
    }

    // Quantity change
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
	
    $(document).on("click", "#checkout-btn", function () {
      const cartItems = Object.values(cart).map(item => ({
          productId: item.ProductID,
          name: item.name,
          quantity: item.quantity,
          price: item.price
      }));
      const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (cartItems.length === 0) {
          Swal.fire({
              title: "Cart Empty",
              text: "Add items to your cart before checking out.",
              icon: "warning",
              confirmButtonColor: "#e3b23c"
          });
          return;
      }

      fetch("http://localhost:3000/save-cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: cartItems, total: total })
      })
      .then(res => res.json())
      .then(data => {
          if (data.success) {
              Swal.fire({
                  title: "Success!",
                  text: "Your cart has been saved.",
                  icon: "success",
                  confirmButtonColor: "#e3b23c"
              }).then(() => {
                  localStorage.removeItem("cart"); // clear cart
                  cart = {};
                  renderCart();
                  window.location.href = "shipping.html";
              });
          } else {
              console.error("Error saving cart:", data.message);
          }
      })
      .catch(err => console.error("Fetch error:", err));
  });
	
    // Add-to-cart from shop AJAX
    $(document).on("click", ".product-btn", function (e) {
        e.preventDefault();
        const productId = $(this).data("id");

        $.getJSON("products.json", function (products) {
            const product = products.find(p => p.ProductID === productId);
            addToCart(product);
            Swal.fire({
                title: 'Item Added!',
                text: 'Item has been added to your cart',
                icon: 'success',
                iconColor: '#e3b23c',
                confirmButtonColor: '#e3b23c'
            });
        });
    });
    
    renderCart();
});

});




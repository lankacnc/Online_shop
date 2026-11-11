
// =====================================
// LOAD PRODUCTS FROM GOOGLE SHEETS
// =====================================

const productContainer =
  document.getElementById("product-list");

function safeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}


// =====================================
// DISPLAY PRODUCTS
// =====================================

async function displayProducts() {
  try {
    const products = await getLankaCNCProducts();

    if (!products.length) {
      productContainer.innerHTML =
        "<p>No products available.</p>";
      return;
    }

    productContainer.innerHTML = products.map(product => {

      const slug = createSlug(product.name);

      const image = safeHTML(product.image);
      const name = safeHTML(product.name);
      const category = safeHTML(product.category);

      const price = Number(product.price) || 0;
      const oldPrice = Number(product.oldPrice) || 0;
      const stock = Number(product.stock) || 0;


      // =====================================
      // DISCOUNT CALCULATION
      // =====================================

      const discountValue = Number(product.discount) || 0;

      const discountPercent = discountValue <= 1
        ? Math.round(discountValue * 100)
        : Math.round(discountValue);

      const discountBadge = discountPercent > 0
        ? `<span class="discount">-${discountPercent}% Off</span>`
        : "";


      // =====================================
      // PRODUCT CARD
      // =====================================

      return `
        <div class="card"
             data-id="${safeHTML(product.id)}"
             data-name="${name}"
             data-price="${price}"
             data-image="${image}"
             data-category="${category}">

          ${discountBadge}

          <a href="product-details.html?product=${encodeURIComponent(slug)}">
            <img src="${image}"
                 alt="${name}"
                 loading="lazy">
          </a>

          <h3>${name}</h3>

          <p class="category">${category}</p>

          <div class="price">
            <strong>Rs. ${price.toLocaleString()}</strong>

            ${
              oldPrice > price
                ? `<del>Rs. ${oldPrice.toLocaleString()}</del>`
                : ""
            }
          </div>

          <p class="stock">
            ${stock > 0 ? "In Stock" : "Out of Stock"}
          </p>

          <button class="add-cart"
                  data-id="${safeHTML(product.id)}"
                  data-name="${name}"
                  data-price="${price}"
                  data-image="${image}"
                  ${stock <= 0 ? "disabled" : ""}>
            Add To Cart
          </button>

        </div>
      `;

    }).join("");

  } catch (error) {

    console.error(error);

    productContainer.innerHTML =
      "<p>Products could not be loaded. Please try again.</p>";
  }
}

displayProducts();

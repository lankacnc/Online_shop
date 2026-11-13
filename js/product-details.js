
/* ==========================================
   LANKACNC - PRODUCT DETAILS PAGE
   Screenshot Matching Version
========================================== */

let currentProduct = null;
let selectedOption = null;

// ==========================================
// GET PRODUCT FROM URL
// ==========================================

const urlParams = new URLSearchParams(window.location.search);
const productSlug = urlParams.get("product");

const productContainer =
    document.getElementById("product-details");

// ==========================================
// HTML SECURITY
// ==========================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function safeURL(value) {
    const url = String(value || "").trim();

    if (
        url.startsWith("https://") ||
        url.startsWith("http://") ||
        url.startsWith("images/") ||
        url.startsWith("manuals/")
    ) {
        return url;
    }

    return "";
}

// ==========================================
// LOAD PRODUCT
// ==========================================

async function loadProductDetails() {

    try {

        if (!productSlug) {
            throw new Error("Product link is missing.");
        }

        productContainer.innerHTML =
            "<p>Loading product details...</p>";

        const products = await getLankaCNCProducts();

        currentProduct = products.find(product =>
            createSlug(product.name) === productSlug
        );

        if (!currentProduct) {
            throw new Error("Product not found.");
        }

        renderProductDetails();

    } catch (error) {

        console.error(error);

        productContainer.innerHTML = `
            <div class="product-error">
                <h2>Product Not Found</h2>
                <p>${escapeHTML(error.message)}</p>
                <a href="index.html">Back to Products</a>
            </div>
        `;
    }
}

// ==========================================
// RENDER PRODUCT DETAILS
// ==========================================

function renderProductDetails() {

    const product = currentProduct;

    const image = safeURL(product.image);

    const oldPrice = Number(product.oldPrice) || 0;

    const options = Array.isArray(product.options)
        ? product.options
        : [];

    selectedOption = options.length
        ? options[0]
        : null;

    const manual1 = safeURL(product.manualPdf1);
    const manual2 = safeURL(product.manualPdf2);

    const rating = product.rating || "★★★★★";

    productContainer.innerHTML = `

        <div class="product-details">

            <!-- PRODUCT IMAGE -->

            <div class="product-details-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name)}"
                    id="details-image"
                >

            </div>


            <!-- PRODUCT INFORMATION -->

            <div class="product-details-info">

                <!-- PRODUCT NAME -->

                <h1>
                    ${escapeHTML(product.name)}
                </h1>


                <!-- CATEGORY -->

                <p class="product-category">
                    ${escapeHTML(product.category)}
                </p>


                <!-- RATING -->

                <div class="product-rating">
                    ${escapeHTML(rating)}
                </div>


                <!-- PRICE -->

                <div class="product-details-price">

                    ${
                        oldPrice > 0 &&
                        oldPrice > Number(
                            selectedOption
                                ? selectedOption.price
                                : product.price
                        )
                        ? `<del>Rs. ${oldPrice.toLocaleString()}</del>`
                        : ""
                    }

                    <strong id="details-price">
                        Rs. 0
                    </strong>

                </div>


                <!-- PRODUCT OPTIONS -->

                ${
                    options.length
                    ? `

                        <div class="product-option-box">

                            <label for="details-option">
                                Select Size / Option
                            </label>

                            <select id="details-option">

                                ${options.map((option, index) => `

                                    <option value="${index}">

                                        ${escapeHTML(option.size)}
                                        - Rs. ${Number(option.price).toLocaleString()}

                                    </option>

                                `).join("")}

                            </select>

                        </div>

                    `
                    : ""
                }


                <!-- STOCK -->

                <div class="product-stock">

                    <span id="details-stock"></span>

                </div>


                <!-- PRODUCT DESCRIPTION -->

<div class="product-description">

    <h3>Product Description</h3>

    <p>
        ${escapeHTML(
            product.description ||
            "No description available."
        )}
    </p>


</div>


                <!-- PRODUCT MANUALS -->

                ${
                    manual1 || manual2
                    ? `

                        <div class="product-manuals">

                            ${
                                manual1
                                ? `

                                    <a
                                        href="${escapeHTML(manual1)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="manual-download"
                                    >
                                        <i class="fa-solid fa-file-pdf"></i>
                                        View / Download Manual 1
                                    </a>

                                `
                                : ""
                            }

                            ${
                                manual2
                                ? `

                                    <a
                                        href="${escapeHTML(manual2)}"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        class="manual-download"
                                    >
                                        <i class="fa-solid fa-file-pdf"></i>
                                        View / Download Manual 2
                                    </a>

                                `
                                : ""
                            }

                        </div>

                    `
                    : ""
                }


                <!-- QUANTITY -->

                <div class="product-quantity">

                    <label for="details-quantity">
                        Quantity
                    </label>

                    <div class="quantity-controls">

                        <button
                            type="button"
                            id="quantity-minus"
                            aria-label="Decrease quantity"
                        >
                            -
                        </button>

                        <input
                            type="number"
                            id="details-quantity"
                            value="1"
                            min="1"
                            step="1"
                        >

                        <button
                            type="button"
                            id="quantity-plus"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>

                </div>


                <!-- TOTAL PRICE -->

                <div class="product-total" id="product-total">

                    Rs. 0

                </div>


                <!-- ADD TO CART -->

                <button
                    type="button"
                    id="details-add-cart"
                    class="add-cart"
                >

                    <i class="fa-solid fa-cart-shopping"></i>

                    Add To Cart

                </button>

            </div>

        </div>

    `;


    // ======================================
    // INITIALIZE PRODUCT
    // ======================================

    updateProductOptionDisplay();

    updateProductTotal();

    updateProductSEO(product);


    // ======================================
    // OPTION CHANGE
    // ======================================

    const optionSelect =
        document.getElementById("details-option");

    if (optionSelect) {

        optionSelect.addEventListener("change", () => {

            const index = Number(optionSelect.value);

            selectedOption = options[index];

            document.getElementById("details-quantity").value = 1;

            updateProductOptionDisplay();

            updateProductTotal();

            updateProductSEO(product);

        });

    }


    // ======================================
    // QUANTITY MINUS
    // ======================================

    document
        .getElementById("quantity-minus")
        .addEventListener("click", () => {

            const input =
                document.getElementById("details-quantity");

            let quantity = Number(input.value) || 1;

            if (quantity > 1) {

                input.value = quantity - 1;

                updateProductTotal();

            }

        });


    // ======================================
    // QUANTITY PLUS
    // ======================================

    document
        .getElementById("quantity-plus")
        .addEventListener("click", () => {

            const input =
                document.getElementById("details-quantity");

            let quantity = Number(input.value) || 1;

            const stock = getCurrentStock();

            if (quantity < stock) {

                input.value = quantity + 1;

                updateProductTotal();

            } else {

                alert("Maximum available stock reached.");

            }

        });


    // ======================================
    // MANUAL QUANTITY INPUT
    // ======================================

    document
        .getElementById("details-quantity")
        .addEventListener("input", updateProductTotal);


    // ======================================
    // ADD TO CART
    // ======================================

    document
        .getElementById("details-add-cart")
        .addEventListener("click", addProductToCart);

}

// ==========================================
// GET CURRENT PRICE
// ==========================================

function getCurrentPrice() {

    return selectedOption
        ? Number(selectedOption.price) || 0
        : Number(currentProduct.price) || 0;

}

// ==========================================
// GET CURRENT STOCK
// ==========================================

function getCurrentStock() {

    return selectedOption
        ? Number(selectedOption.stock) || 0
        : Number(currentProduct.stock) || 0;

}

// ==========================================
// UPDATE PRICE AND STOCK
// ==========================================

function updateProductOptionDisplay() {

    if (!currentProduct) return;

    const price = getCurrentPrice();

    const stock = getCurrentStock();

    const priceElement =
        document.getElementById("details-price");

    const stockElement =
        document.getElementById("details-stock");

    const addButton =
        document.getElementById("details-add-cart");

    priceElement.textContent =
        "Rs. " + price.toLocaleString();

    stockElement.textContent =
        stock > 0
            ? "In Stock"
            : "Out of Stock";

    addButton.disabled = stock <= 0;

    updateProductTotal();

}

// ==========================================
// UPDATE TOTAL PRICE
// ==========================================

function updateProductTotal() {

    if (!currentProduct) return;

    const quantityInput =
        document.getElementById("details-quantity");

    const totalElement =
        document.getElementById("product-total");

    if (!quantityInput || !totalElement) return;

    let quantity = Number(quantityInput.value);

    const stock = getCurrentStock();

    const price = getCurrentPrice();

    if (!Number.isInteger(quantity) || quantity < 1) {
        quantity = 1;
    }

    if (stock > 0 && quantity > stock) {
        quantity = stock;
    }

    quantityInput.value = quantity;

    const total = price * quantity;

    totalElement.textContent =
        "Rs. " + total.toLocaleString();

}

// ==========================================
// ADD PRODUCT TO CART
// ==========================================

function addProductToCart() {

    if (!currentProduct) return;

    const quantityInput =
        document.getElementById("details-quantity");

    const quantity = Number(quantityInput.value);

    const stock = getCurrentStock();

    const price = getCurrentPrice();

    if (!Number.isInteger(quantity) || quantity < 1) {

        alert("Please enter a valid quantity.");

        return;
    }

    if (quantity > stock) {

        alert("Sorry! Requested quantity is not available.");

        return;
    }

    const cart = JSON.parse(
        localStorage.getItem("cart") || "[]"
    );

    const size = selectedOption
        ? selectedOption.size
        : "";

    const existingProduct = cart.find(item =>

        Number(item.id) === Number(currentProduct.id) &&

        String(item.size || "") === String(size)

    );


    if (existingProduct) {

        if (
            Number(existingProduct.quantity) + quantity > stock
        ) {

            alert("Not enough stock available.");

            return;
        }

        existingProduct.quantity =
            Number(existingProduct.quantity) + quantity;

    } else {

        cart.push({

            id: currentProduct.id,

            name: currentProduct.name,

            price: price,

            image: currentProduct.image,

            size: size,

            quantity: quantity

        });

    }


    // SAVE CART

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );


    alert("Product added to cart successfully!");

    window.location.href = "cart.html";

}

// ==========================================
// SEO INFORMATION
// ==========================================

function updateProductSEO(product) {

    const pageURL = window.location.href;

    const imageURL = safeURL(product.image);

    document.title =
        product.name + " | LankaCNC.LK";

    const description =
        product.description ||
        "Buy " + product.name + " from LankaCNC Sri Lanka.";


    const metaDescription =
        document.querySelector('meta[name="description"]');

    if (metaDescription) {
        metaDescription.content = description;
    }


    const canonical =
        document.getElementById("canonical-url");

    if (canonical) {
        canonical.href = pageURL;
    }


    const ogTitle =
        document.querySelector('meta[property="og:title"]');

    const ogDescription =
        document.querySelector('meta[property="og:description"]');

    const ogImage =
        document.querySelector('meta[property="og:image"]');

    const ogURL =
        document.querySelector('meta[property="og:url"]');


    if (ogTitle) {
        ogTitle.content = product.name;
    }

    if (ogDescription) {
        ogDescription.content = description;
    }

    if (ogImage && imageURL) {

        ogImage.content =
            new URL(imageURL, window.location.href).href;

    }

    if (ogURL) {
        ogURL.content = pageURL;
    }


    // PRODUCT SCHEMA

    const schema = {

        "@context": "https://schema.org",

        "@type": "Product",

        "name": product.name,

        "image": imageURL
            ? [new URL(imageURL, window.location.href).href]
            : [],

        "description": description,

        "sku": String(product.id),

        "brand": {

            "@type": "Brand",

            "name": "LankaCNC"

        },

        "offers": {

            "@type": "Offer",

            "priceCurrency": "LKR",

            "price": String(getCurrentPrice()),

            "availability": getCurrentStock() > 0
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"

        }

    };


    const schemaElement =
        document.getElementById("product-schema");

    if (schemaElement) {

        schemaElement.textContent =
            JSON.stringify(schema);

    }

}

// ==========================================
// START PRODUCT DETAILS
// ==========================================

loadProductDetails();

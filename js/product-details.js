
// ==========================================
// LANKACNC - GOOGLE SHEETS PRODUCT DETAILS
// ==========================================

let currentProduct = null;
let selectedOption = null;

// ==========================================
// GET PRODUCT SLUG FROM URL
// Example:
// product-details.html?product=richauto-a18-4-axis-dsp-cnc-controller
// ==========================================

const urlParams = new URLSearchParams(window.location.search);
const productSlug = urlParams.get("product");

const productContainer =
    document.getElementById("product-details");

// ==========================================
// HTML SECURITY HELPER
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

// Allow only HTTP(S) or relative URLs for images and manuals.
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
// LOAD PRODUCT FROM GOOGLE SHEETS
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

        console.error("Product loading error:", error);

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
// DISPLAY PRODUCT DETAILS
// ==========================================

function renderProductDetails() {

    const product = currentProduct;

    const image = safeURL(product.image);

    const oldPrice = Number(product.oldPrice) || 0;
    const price = Number(product.price) || 0;

    const options = Array.isArray(product.options)
        ? product.options
        : [];

    selectedOption = options.length ? options[0] : null;

    const manual1 = safeURL(product.manualPdf1);
    const manual2 = safeURL(product.manualPdf2);

    productContainer.innerHTML = `

        <div class="product-details">

            <div class="product-details-image">

                <img
                    src="${escapeHTML(image)}"
                    alt="${escapeHTML(product.name)}"
                    id="details-image"
                >

            </div>

            <div class="product-details-info">

                <p class="product-category">
                    ${escapeHTML(product.category)}
                </p>

                <h1>
                    ${escapeHTML(product.name)}
                </h1>

                <div class="product-rating">
                    ${escapeHTML(product.rating || "")}
                </div>

                <div class="product-details-price">

                    <strong id="details-price">
                        Rs. ${price.toLocaleString()}
                    </strong>

                    ${
                        oldPrice > price
                        ? `<del>Rs. ${oldPrice.toLocaleString()}</del>`
                        : ""
                    }

                </div>

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

                <div class="product-stock">
                    <span id="details-stock"></span>
                </div>

                <div class="product-quantity">

                    <label for="details-quantity">
                        Quantity
                    </label>

                    <input
                        type="number"
                        id="details-quantity"
                        value="1"
                        min="1"
                        step="1"
                    >

                </div>

                <button
                    type="button"
                    id="details-add-cart"
                    class="add-cart"
                >
                    <i class="fa-solid fa-cart-shopping"></i>
                    Add To Cart
                </button>

                <div class="product-description">

                    <h3>Product Description</h3>

                    <p>${escapeHTML(product.description || "No description available.")}</p>

                </div>

                ${
                    manual1 || manual2
                    ? `
                        <div class="product-manuals">
                            <h3>Product Manuals</h3>

                            ${
                                manual1
                                ? `<a href="${escapeHTML(manual1)}" target="_blank" rel="noopener">
                                    Download Manual 1
                                   </a>`
                                : ""
                            }

                            ${
                                manual2
                                ? `<a href="${escapeHTML(manual2)}" target="_blank" rel="noopener">
                                    Download Manual 2
                                   </a>`
                                : ""
                            }
                        </div>
                    `
                    : ""
                }

            </div>

        </div>
    `;

    // Update SEO information
    updateProductSEO(product);

    // Update selected price and stock
    updateProductOptionDisplay();

    // Attach option change event
    const optionSelect =
        document.getElementById("details-option");

    if (optionSelect) {
        optionSelect.addEventListener("change", () => {

            const index = Number(optionSelect.value);

            selectedOption = options[index];

            updateProductOptionDisplay();
        });
    }

    // Attach add to cart event
    document
        .getElementById("details-add-cart")
        .addEventListener("click", addProductToCart);
}

// ==========================================
// UPDATE PRICE AND STOCK
// ==========================================

function updateProductOptionDisplay() {

    if (!currentProduct) return;

    const price = selectedOption
        ? Number(selectedOption.price) || 0
        : Number(currentProduct.price) || 0;

    const stock = selectedOption
        ? Number(selectedOption.stock) || 0
        : Number(currentProduct.stock) || 0;

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
            ? `In Stock (${stock})`
            : "Out of Stock";

    addButton.disabled = stock <= 0;
}

// ==========================================
// ADD PRODUCT TO CART
// ==========================================

function addProductToCart() {

    if (!currentProduct) return;

    const quantityInput =
        document.getElementById("details-quantity");

    const quantity = Number(quantityInput.value);

    const stock = selectedOption
        ? Number(selectedOption.stock) || 0
        : Number(currentProduct.stock) || 0;

    const price = selectedOption
        ? Number(selectedOption.price) || 0
        : Number(currentProduct.price) || 0;

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

        if (Number(existingProduct.quantity) + quantity > stock) {
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

    localStorage.setItem("cart", JSON.stringify(cart));

    alert("Product added to cart successfully!");

    window.location.href = "cart.html";
}

// ==========================================
// UPDATE SEO / SOCIAL MEDIA INFORMATION
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

    if (ogTitle) ogTitle.content = product.name;

    if (ogDescription) ogDescription.content = description;

    if (ogImage && imageURL) {
        ogImage.content = new URL(imageURL, window.location.href).href;
    }

    if (ogURL) ogURL.content = pageURL;

    // Product structured data
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
            "price": String(
                selectedOption
                    ? selectedOption.price
                    : product.price
            ),
            "availability": (
                Number(selectedOption
                    ? selectedOption.stock
                    : product.stock) > 0
            )
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock"
        }
    };

    const schemaElement =
        document.getElementById("product-schema");

    if (schemaElement) {
        schemaElement.textContent = JSON.stringify(schema);
    }
}

// ==========================================
// START
// ==========================================

loadProductDetails();

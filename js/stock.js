
/* ==========================================
   LANKACNC STOCK + PRICE SYSTEM
   Google Sheets API
   ========================================== */

const STOCK_API_URL =
    "https://script.google.com/macros/s/AKfycbxYkRyLnMCvU9aecBTwUy62smFCrg6uvuFXnHvFZxYAG4svSwZl-dI-Ox-4sbzM3XLb/exec";


/* ==========================================
   FORMAT PRICE
   ========================================== */

function formatPrice(price) {
    const number = Number(price) || 0;

    return "Rs." + number.toLocaleString("en-LK");
}


/* ==========================================
   UPDATE PRODUCT CARD
   ========================================== */

function updateProductCard(product, options = {}) {

    if (!product || product.id === undefined) {
        return;
    }

    const card = Array.from(
        document.querySelectorAll(".card[data-id]")
    ).find(item =>
        item.dataset.id === String(product.id)
    );

    if (!card) {
        return;
    }

    const stockElement = card.querySelector(".stock");
    const cartButton = card.querySelector(".add-cart");

    const priceElement = card.querySelector(".price strong");
    const oldPriceElement = card.querySelector(".price del");
    const discountElement = card.querySelector(".discount");

    const stock = Math.max(0, Number(product.stock) || 0);
    const price = Number(product.price) || 0;
    const oldPrice = Number(product.oldPrice) || 0;
    const discount = Number(product.discount) || 0;

    const hasMultipleSizes = options.hasMultipleSizes === true;
    const anySizeInStock = options.anySizeInStock === true;

    /* ----------------------------------------
       UPDATE PRICE
       ---------------------------------------- */

    // Sizes have different prices.
    // Keep the homepage's existing starting price.
    if (!hasMultipleSizes) {

        if (priceElement && price > 0) {
            priceElement.textContent = formatPrice(price);
        }

        if (oldPriceElement && oldPrice > 0) {
            oldPriceElement.textContent = formatPrice(oldPrice);
        }

        if (discountElement) {

            if (discount > 0) {
                discountElement.textContent = `-${discount}%`;
                discountElement.style.display = "";
            } else {
                discountElement.textContent = "";
                discountElement.style.display = "none";
            }
        }

        if (cartButton && price > 0) {
            cartButton.dataset.price = String(price);
        }
    }

    /* ----------------------------------------
       CHECK STOCK
       ---------------------------------------- */

    // Multiple sizes:
    // If at least one size has stock, show In Stock.
    //
    // Single-size products:
    // Use that product's actual stock quantity.

    const inStock = hasMultipleSizes
        ? anySizeInStock
        : stock > 0;

    /* ----------------------------------------
       UPDATE STOCK LABEL
       ---------------------------------------- */

    if (stockElement) {

        if (inStock) {

            stockElement.textContent = hasMultipleSizes
                ? "In Stock - Select Size"
                : "In Stock";

            stockElement.classList.remove("out-of-stock");
            stockElement.classList.add("in-stock");

        } else {

            stockElement.textContent = "Out of Stock";

            stockElement.classList.remove("in-stock");
            stockElement.classList.add("out-of-stock");
        }
    }

    /* ----------------------------------------
       UPDATE ADD TO CART BUTTON
       ---------------------------------------- */

    if (cartButton) {

        cartButton.disabled = !inStock;

        cartButton.textContent = inStock
            ? "Add to Cart"
            : "Out of Stock";

        cartButton.classList.toggle(
            "out-of-stock",
            !inStock
        );
    }
}


/* ==========================================
   LOAD STOCK FROM GOOGLE SHEETS
   ========================================== */

async function loadProductStock() {

    try {

        console.log("Loading stock from Google Sheets...");

        const response = await fetch(STOCK_API_URL, {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error(
                `HTTP error: ${response.status}`
            );
        }

        const products = await response.json();

        if (!Array.isArray(products)) {
            throw new Error(
                "Google Sheets response is not an array."
            );
        }

        console.log("Products received:", products);

        /* ------------------------------------
           GROUP PRODUCTS BY PRODUCT ID
           ------------------------------------ */

        const productGroups = new Map();

        products.forEach(product => {

            if (!product || product.id === undefined) {
                return;
            }

            const id = String(product.id);

            if (!productGroups.has(id)) {
                productGroups.set(id, []);
            }

            productGroups.get(id).push(product);
        });

        /* ------------------------------------
           UPDATE EACH PRODUCT
           ------------------------------------ */

        productGroups.forEach((rows, id) => {

            const card = Array.from(
                document.querySelectorAll(".card[data-id]")
            ).find(item =>
                item.dataset.id === id
            );

            if (!card) {
                return;
            }

            // Find rows that have a size value.
            const sizeRows = rows.filter(row =>
                String(row.size || "").trim() !== ""
            );

            // Product has multiple sizes.
            if (sizeRows.length > 1) {

                const anySizeInStock = sizeRows.some(row =>
                    Number(row.stock) > 0
                );

                updateProductCard(
                    {
                        ...sizeRows[0],
                        stock: anySizeInStock ? 1 : 0
                    },
                    {
                        hasMultipleSizes: true,
                        anySizeInStock: anySizeInStock
                    }
                );

            } else {

                // Normal product with one stock entry.
                updateProductCard(rows[0]);
            }
        });

        console.log(
            `Updated stock for ${productGroups.size} product IDs.`
        );

    } catch (error) {

        console.error(
            "Stock loading failed:",
            error
        );
    }
}


/* ==========================================
   INITIALIZE
   ========================================== */

document.addEventListener(
    "DOMContentLoaded",
    loadProductStock
);

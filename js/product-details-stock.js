// ==========================================
// LANKACNC
// PRODUCT PRICE + BIT SIZE + STOCK SYSTEM
// GOOGLE SHEET
// ==========================================


// ==========================================
// GOOGLE APPS SCRIPT API
// ==========================================

const STOCK_API_URL =
    "https://script.google.com/macros/s/AKfycbxYkRyLnMCvU9aecBTwUy62smFCrg6uvuFXnHvFZxYAG4svSwZl-dI-Ox-4sbzM3XLb/exec";


// ==========================================
// GLOBAL LIVE DATA
// ==========================================

window.lankaCncStockData = [];


// ==========================================
// LOAD GOOGLE SHEET DATA
// ==========================================

async function loadProductStock() {

    try {

        const response =
            await fetch(
                STOCK_API_URL,
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Failed to load Google Sheet data."
            );

        }


        const stockProducts =
            await response.json();


        if (!Array.isArray(stockProducts)) {

            throw new Error(
                "Google Sheet API did not return an array."
            );

        }


        // Save globally
        window.lankaCncStockData =
            stockProducts;


        console.log(
            "LankaCNC Google Sheet Data:",
            stockProducts
        );


        // ======================================
        // UPDATE PRODUCT DETAILS
        // ======================================

        updateProductDetails(
            stockProducts
        );


        // ======================================
        // UPDATE PRODUCT CARDS
        // ======================================

        updateProductCards(
            stockProducts
        );


    }

    catch (error) {

        console.error(
            "LankaCNC stock loading error:",
            error
        );

    }

}


// ==========================================
// GET CURRENT PRODUCT ID
// ==========================================

function getCurrentProductId() {

    const productDetails =
        document.getElementById(
            "product-details"
        );


    if (!productDetails) {
        return null;
    }


    return productDetails.getAttribute(
        "data-product-id"
    );

}


// ==========================================
// GET SELECTED BIT SIZE
// ==========================================

function getSelectedBitSize() {

    const selectedSize =
        document.querySelector(
            'input[name="bitSize"]:checked'
        );


    if (!selectedSize) {
        return "";
    }


    return selectedSize.value.trim();

}


// ==========================================
// FIND LIVE PRODUCT / VARIANT
// ==========================================

function findLiveProduct(
    stockProducts,
    productId,
    bitSize = ""
) {

    const id =
        String(productId);


    const size =
        String(bitSize || "")
            .trim()
            .toLowerCase();


    // ======================================
    // PRODUCT WITH BIT SIZE
    // ======================================

    if (size) {

        const variant =
            stockProducts.find(
                item =>

                    String(item.id) === id &&

                    String(item.bitSize || "")
                        .trim()
                        .toLowerCase() === size
            );


        if (variant) {
            return variant;
        }

    }


    // ======================================
    // PRODUCT WITHOUT BIT SIZE
    // ======================================

    const normalProduct =
        stockProducts.find(
            item =>
                String(item.id) === id &&
                !String(item.bitSize || "").trim()
        );


    if (normalProduct) {
        return normalProduct;
    }


    // ======================================
    // FALLBACK
    // ======================================

    return stockProducts.find(
        item =>
            String(item.id) === id
    ) || null;

}


// ==========================================
// UPDATE PRODUCT DETAILS
// ==========================================

function updateProductDetails(
    stockProducts
) {

    const productDetails =
        document.getElementById(
            "product-details"
        );


    if (!productDetails) {
        return;
    }


    const product =
        window.currentProduct;


    if (!product) {

        console.warn(
            "Current product not found."
        );

        return;
    }


    const productId =
        productDetails.getAttribute(
            "data-product-id"
        );


    if (!productId) {
        return;
    }


    // ======================================
    // GET SELECTED SIZE
    // ======================================

    const selectedBitSize =
        getSelectedBitSize();


    // ======================================
    // FIND GOOGLE SHEET VARIANT
    // ======================================

    const liveProduct =
        findLiveProduct(
            stockProducts,
            productId,
            selectedBitSize
        );


    if (!liveProduct) {

        console.warn(
            "Google Sheet product not found:",
            productId,
            selectedBitSize
        );

        return;
    }


    // ======================================
    // LIVE VALUES
    // ======================================

    const stock =
        Number(
            liveProduct.stock
        ) || 0;


    const price =
        Number(
            liveProduct.price
        ) || 0;


    const oldPrice =
        Number(
            liveProduct.oldPrice
        ) || 0;


    const discount =
        String(
            liveProduct.discount || ""
        );


    // ======================================
    // SAVE CURRENT LIVE VARIANT
    // ======================================

    product.stock =
        stock;


    product.livePrice =
        price;


    product.liveOldPrice =
        oldPrice;


    product.liveDiscount =
        discount;


    product.liveBitSize =
        liveProduct.bitSize || "";


    // ======================================
    // ELEMENTS
    // ======================================

    const stockElement =
        productDetails.querySelector(
            ".stock"
        );


    const discountElement =
        productDetails.querySelector(
            ".discount"
        );


    const currentPriceElement =
        document.getElementById(
            "currentPrice"
        );


    const selectedPriceElement =
        document.getElementById(
            "selectedPrice"
        );


    const oldPriceElement =
        productDetails.querySelector(
            ".price del"
        );


    const addCartBtn =
        document.getElementById(
            "addCartBtn"
        );


    const quantityInput =
        document.getElementById(
            "quantity"
        );


    const plusBtn =
        document.getElementById(
            "plusBtn"
        );


    const minusBtn =
        document.getElementById(
            "minusBtn"
        );


    // ======================================
    // UPDATE PRICE
    // ======================================

    if (currentPriceElement) {

        currentPriceElement.textContent =
            "Rs." +
            price.toLocaleString();

    }


    if (selectedPriceElement) {

        selectedPriceElement.textContent =
            price.toLocaleString();

    }


    // ======================================
    // UPDATE OLD PRICE
    // ======================================

    if (oldPriceElement) {

        oldPriceElement.textContent =
            "Rs." +
            oldPrice.toLocaleString();

    }


    // ======================================
    // UPDATE DISCOUNT
    // ======================================

    if (discountElement) {

        const discountNumber =
            String(discount)
                .replace("%", "")
                .trim();


        discountElement.textContent =
            "-" +
            discountNumber +
            "%";

    }


    // ======================================
    // UPDATE SELECTED RADIO PRICE
    // ======================================

    const selectedSizeInput =
        document.querySelector(
            'input[name="bitSize"]:checked'
        );


    if (selectedSizeInput) {

        // Google Sheet price becomes
        // the current selected price

        selectedSizeInput.dataset.price =
            price;

    }


    // ======================================
    // UPDATE STOCK
    // ======================================

    if (stock > 0) {

        // ----------------------------------
        // IN STOCK
        // ----------------------------------

        if (stockElement) {

            stockElement.textContent =
                "In Stock";


            stockElement.classList.remove(
                "out-of-stock"
            );


            stockElement.classList.add(
                "in-stock"
            );

        }


        // ----------------------------------
        // ENABLE CART
        // ----------------------------------

        if (addCartBtn) {

            addCartBtn.disabled =
                false;


            addCartBtn.innerHTML =
                '<i class="fa-solid fa-cart-shopping"></i> Add To Cart';

        }


        // ----------------------------------
        // ENABLE QUANTITY
        // ----------------------------------

        if (quantityInput) {

            quantityInput.disabled =
                false;


            quantityInput.max =
                stock;


            let quantity =
                Number(
                    quantityInput.value
                ) || 1;


            if (quantity < 1) {
                quantity = 1;
            }


            if (quantity > stock) {
                quantity = stock;
            }


            quantityInput.value =
                quantity;

        }


        // ----------------------------------
        // ENABLE PLUS
        // ----------------------------------

        if (plusBtn) {

            plusBtn.disabled =
                false;

        }


        // ----------------------------------
        // ENABLE MINUS
        // ----------------------------------

        if (minusBtn) {

            minusBtn.disabled =
                false;

        }

    }


    else {

        // ----------------------------------
        // OUT OF STOCK
        // ----------------------------------

        if (stockElement) {

            stockElement.textContent =
                "Out of Stock";


            stockElement.classList.remove(
                "in-stock"
            );


            stockElement.classList.add(
                "out-of-stock"
            );

        }


        // ----------------------------------
        // DISABLE CART
        // ----------------------------------

        if (addCartBtn) {

            addCartBtn.disabled =
                true;


            addCartBtn.innerHTML =
                '<i class="fa-solid fa-ban"></i> Out of Stock';

        }


        // ----------------------------------
        // DISABLE QUANTITY
        // ----------------------------------

        if (quantityInput) {

            quantityInput.value =
                0;


            quantityInput.disabled =
                true;

        }


        // ----------------------------------
        // DISABLE PLUS
        // ----------------------------------

        if (plusBtn) {

            plusBtn.disabled =
                true;

        }


        // ----------------------------------
        // DISABLE MINUS
        // ----------------------------------

        if (minusBtn) {

            minusBtn.disabled =
                true;

        }

    }


    // ======================================
    // UPDATE SCHEMA
    // ======================================

    if (
        typeof window.updateProductSchema ===
        "function"
    ) {

        window.updateProductSchema();

    }


    console.log(
        "LIVE VARIANT:",
        {
            id: productId,
            bitSize: selectedBitSize,
            price: price,
            stock: stock
        }
    );

}


// ==========================================
// UPDATE PRODUCT CARDS
// ==========================================

function updateProductCards(
    stockProducts
) {

    if (!Array.isArray(stockProducts)) {
        return;
    }


    // --------------------------------------
    // GROUP FIRST RECORD BY PRODUCT ID
    // --------------------------------------

    const firstProductById =
        new Map();


    stockProducts.forEach(
        liveProduct => {

            const id =
                String(liveProduct.id);


            if (!firstProductById.has(id)) {

                firstProductById.set(
                    id,
                    liveProduct
                );

            }

        }
    );


    firstProductById.forEach(
        liveProduct => {

            const card =
                document.querySelector(
                    `.card[data-id="${liveProduct.id}"]`
                );


            if (!card) {
                return;
            }


            const stock =
                Number(
                    liveProduct.stock
                ) || 0;


            const price =
                Number(
                    liveProduct.price
                ) || 0;


            const oldPrice =
                Number(
                    liveProduct.oldPrice
                ) || 0;


            const discount =
                String(
                    liveProduct.discount || ""
                );


            const stockElement =
                card.querySelector(
                    ".stock"
                );


            const cartButton =
                card.querySelector(
                    ".add-cart"
                );


            const priceElement =
                card.querySelector(
                    ".price strong"
                );


            const oldPriceElement =
                card.querySelector(
                    ".price del"
                );


            const discountElement =
                card.querySelector(
                    ".discount"
                );


            // --------------------------------
            // PRICE
            // --------------------------------

            if (priceElement) {

                priceElement.textContent =
                    "Rs." +
                    price.toLocaleString();

            }


            // --------------------------------
            // OLD PRICE
            // --------------------------------

            if (oldPriceElement) {

                oldPriceElement.textContent =
                    "Rs." +
                    oldPrice.toLocaleString();

            }


            // --------------------------------
            // DISCOUNT
            // --------------------------------

            if (discountElement) {

                discountElement.textContent =
                    "-" +
                    discount.replace("%", "") +
                    "%";

            }


            // --------------------------------
            // STOCK
            // --------------------------------

            if (stock > 0) {

                if (stockElement) {

                    stockElement.textContent =
                        "In Stock";


                    stockElement.classList.remove(
                        "out-of-stock"
                    );


                    stockElement.classList.add(
                        "in-stock"
                    );

                }


                if (cartButton) {

                    cartButton.disabled =
                        false;


                    cartButton.textContent =
                        "Add to Cart";

                }

            }

            else {

                if (stockElement) {

                    stockElement.textContent =
                        "Out of Stock";


                    stockElement.classList.remove(
                        "in-stock"
                    );


                    stockElement.classList.add(
                        "out-of-stock"
                    );

                }


                if (cartButton) {

                    cartButton.disabled =
                        true;


                    cartButton.textContent =
                        "Out of Stock";

                }

            }

        }
    );

}


// ==========================================
// BIT SIZE CHANGE
// ==========================================

function setupBitSizeStockSystem() {

    const sizeInputs =
        document.querySelectorAll(
            'input[name="bitSize"]'
        );


    if (!sizeInputs.length) {
        return;
    }


    sizeInputs.forEach(
        input => {

            input.addEventListener(
                "change",
                function() {

                    console.log(
                        "Size Changed:",
                        this.value
                    );


                    // Update using Google Sheet
                    updateProductDetails(
                        window.lankaCncStockData
                    );

                }
            );

        }
    );

}


// ==========================================
// START SYSTEM
// ==========================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "LankaCNC Price + Size + Stock System started."
        );


        // First load Google Sheet
        loadProductStock();


        // Wait until product-details.js
        // creates the radio buttons
        setTimeout(
            setupBitSizeStockSystem,
            100
        );

    }
);

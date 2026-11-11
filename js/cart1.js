// ========================================
// SHOPPING CART
// ========================================

// Get cart from localStorage
let cart = JSON.parse(localStorage.getItem("cart")) || [];


// ========================================
// HTML ELEMENTS
// ========================================

const cartItems = document.getElementById("cart-items");
const totalElement = document.getElementById("total");
const cartCount = document.getElementById("cart-count");

const couponInput = document.getElementById("coupon");
const applyCouponButton = document.getElementById("apply-coupon");
const couponMessage = document.getElementById("coupon-message");

const checkoutLink = document.getElementById("checkout-link");


// ========================================
// COUPON VARIABLES
// ========================================

let discount = 0;


// ========================================
// RENDER CART
// ========================================

function renderCart() {

    // Clear existing cart items
    cartItems.innerHTML = "";

    let netTotal = 0;


    // ========================================
    // EMPTY CART
    // ========================================

    if (cart.length === 0) {

        cartItems.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cart">
                    <h3>Your cart is empty</h3>

                    <p>
                        Add some products to your shopping cart.
                    </p>

                    <a href="products.html">
                        Continue Shopping
                    </a>
                </td>
            </tr>
        `;

        totalElement.textContent = "Net Total : Rs. 0";

        updateCartCount();

        return;
    }


    // ========================================
    // DISPLAY PRODUCTS
    // ========================================

    cart.forEach((item, index) => {

        // Make sure quantity is valid
        item.quantity = Number(item.quantity) || 1;

        // Calculate item total
        let itemTotal =
            Number(item.price) * item.quantity;

        // Add to total
        netTotal += itemTotal;


        // Add product row
        cartItems.innerHTML += `

            <tr>

                <!-- Product Image -->

                <td>
                    <img
                        src="${item.image}"
                        width="80"
                        height="80"
                        alt="${item.name}">
                </td>


                <!-- Product Name -->

                <td>
                    ${item.name}
                </td>


                <!-- Unit Price -->

                <td>
                    Rs.
                    ${Number(item.price).toLocaleString()}
                </td>


                <!-- Quantity -->

                <td class="quantity-control">

                    <button
                        onclick="decrease(${index})">
                        −
                    </button>


                    <span class="qty">
                        ${item.quantity}
                    </span>


                    <button
                        onclick="increase(${index})">
                        +
                    </button>

                </td>


                <!-- Item Total -->

                <td>
                    Rs.
                    ${itemTotal.toLocaleString()}
                </td>


                <!-- Remove -->

                <td>

                    <button
                        class="remove-btn"
                        onclick="removeItem(${index})">

                        Remove

                    </button>

                </td>

            </tr>

        `;

    });


    // ========================================
    // APPLY DISCOUNT
    // ========================================

    let discountAmount =
        netTotal * discount;

    let finalTotal =
        netTotal - discountAmount;


    // ========================================
    // DISPLAY TOTAL
    // ========================================

    if (discount > 0) {

        totalElement.innerHTML = `

            <div>
                Subtotal :
                Rs. ${netTotal.toLocaleString()}
            </div>

            <div>
                Discount :
                Rs. ${discountAmount.toLocaleString()}
            </div>

            <div>
                <strong>
                    Net Total :
                    Rs. ${finalTotal.toLocaleString()}
                </strong>
            </div>

        `;

    } else {

        totalElement.textContent =
            "Net Total : Rs. " +
            netTotal.toLocaleString();

    }


    // Update cart count
    updateCartCount();

}


// ========================================
// INCREASE QUANTITY
// ========================================

function increase(index) {

    if (!cart[index]) {
        return;
    }

    cart[index].quantity =
        Number(cart[index].quantity) + 1;

    saveCart();

}


// ========================================
// DECREASE QUANTITY
// ========================================

function decrease(index) {

    if (!cart[index]) {
        return;
    }


    if (cart[index].quantity > 1) {

        cart[index].quantity--;

    } else {

        // Remove product if quantity reaches 0
        cart.splice(index, 1);

    }

    saveCart();

}


// ========================================
// REMOVE PRODUCT
// ========================================

function removeItem(index) {

    if (!cart[index]) {
        return;
    }

    cart.splice(index, 1);

    saveCart();

}


// ========================================
// SAVE CART
// ========================================

function saveCart() {

    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    renderCart();

}


// ========================================
// UPDATE CART COUNT
// ========================================

function updateCartCount() {

    let count = 0;


    // Calculate total quantity
    cart.forEach(item => {

        count +=
            Number(item.quantity) || 0;

    });


    // Update cart icon/count
    if (cartCount) {

        cartCount.textContent = count;

    }

}


// ========================================
// COUPON SYSTEM
// ========================================

if (applyCouponButton) {

    applyCouponButton.addEventListener(
        "click",
        function () {

            const coupon =
                couponInput.value
                    .trim()
                    .toUpperCase();


            // Example coupon
            if (coupon === "TECH10") {

                discount = 0.10;

                couponMessage.textContent =
                    "Coupon applied! You received 10% discount.";

                renderCart();

            }


            // Example coupon
            else if (coupon === "TECH20") {

                discount = 0.20;

                couponMessage.textContent =
                    "Coupon applied! You received 20% discount.";

                renderCart();

            }


            // Empty coupon
            else if (coupon === "") {

                discount = 0;

                couponMessage.textContent =
                    "Please enter a coupon code.";

            }


            // Invalid coupon
            else {

                discount = 0;

                couponMessage.textContent =
                    "Invalid coupon code.";

                renderCart();

            }

        }
    );

}


// ========================================
// CHECKOUT PROTECTION
// ========================================

if (checkoutLink) {

    checkoutLink.addEventListener(
        "click",
        function (event) {

            if (cart.length === 0) {

                event.preventDefault();

                alert(
                    "Your shopping cart is empty."
                );

                return;

            }

            // Save latest cart
            localStorage.setItem(
                "cart",
                JSON.stringify(cart)
            );

        }
    );

}


// ========================================
// INITIAL LOAD
// ========================================

renderCart();

function addToCart(product) {

    let cart = JSON.parse(
        localStorage.getItem("cart")
    ) || [];

    // Check whether product already exists
    let existingProduct = cart.find(
        item => item.id === product.id
    );

    if (existingProduct) {

        // Increase quantity
        existingProduct.quantity += 1;

    } else {

        // Add new product
        cart.push({
            id: product.id,
            name: product.name,
            price: Number(product.price),
            image: product.image,
            quantity: 1
        });

    }

    // Save cart
    localStorage.setItem(
        "cart",
        JSON.stringify(cart)
    );

    alert(
        product.name + " added to cart!"
    );
}
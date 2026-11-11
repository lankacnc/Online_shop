let cart = JSON.parse(localStorage.getItem("cart")) || [];

const orderItems =
document.getElementById("order-items");

let subtotal = 0;

cart.forEach(item => {

const total =
item.price * item.quantity;

subtotal += total;

orderItems.innerHTML += `

<tr>
<td>

<img
src="${item.image}"
width="60"
alt="${item.name}">

</td>
<td>${item.name}</td>

<td>Rs.${item.price.toLocaleString()}</td>

<td>${item.quantity}</td>

<td>Rs. ${(item.price * item.quantity).toLocaleString()}</td>

</tr>

`;

});

let delivery = 500;

let discount = 0;

// Example Coupon
if(localStorage.getItem("coupon") === "SAVE10"){

discount = subtotal * 0.10;

}

let grandTotal =
subtotal + delivery - discount;

document.getElementById("subtotal").innerHTML =
"Rs." + subtotal.toLocaleString();

document.getElementById("delivery").innerHTML =
"Rs." + delivery.toLocaleString();

document.getElementById("discount").innerHTML =
"- Rs." + discount.toLocaleString();

document.getElementById("grand-total").innerHTML =
"Rs." + grandTotal.toLocaleString();

document
.getElementById("whatsapp-btn")
.addEventListener("click", sendWhatsApp);

function sendWhatsApp(){

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();

    const province = document.getElementById("province").value;
    const district = document.getElementById("district").value;
    const city = document.getElementById("city").value.trim();

    const address = document.getElementById("address").value.trim();
    const postcode = document.getElementById("postcode").value.trim();

    const payment = document.querySelector(
        'input[name="payment"]:checked'
    ).value;

    const orderNumber =
    document.getElementById("order-number").textContent;

    if(
        !name ||
        !phone ||
        !province ||
        !district ||
        !city ||
        !address
    ){

        alert("Please fill all required fields.");

        return;

    }

    let message = "";

    message += "🛒 *TECH STORE ORDER*%0A%0A";

    message += "📄 *Order Number*%0A";
    message += orderNumber + "%0A%0A";

    message += "👤 *Customer Details*%0A";

    message += "Name: " + name + "%0A";
    message += "Phone: " + phone + "%0A";
    message += "Email: " + email + "%0A";

    message += "Province: " + province + "%0A";
    message += "District: " + district + "%0A";
    message += "City: " + city + "%0A";

    message += "Address: " + address + "%0A";

    if(postcode !== ""){

        message += "Postal Code: " + postcode + "%0A";

    }

    message += "%0A";

    message += "💳 *Payment Method*%0A";
    message += payment + "%0A%0A";

    message += "📦 *Order Items*%0A";

    cart.forEach(item=>{

        message +=
        "• " +
        item.name +
        "%0A";

        message +=
        "  Qty : " +
        item.quantity +
        "%0A";

        message +=
        "  Total : Rs." +
        (item.price * item.quantity).toLocaleString() +
        "%0A%0A";

    });

    message += "-------------------------%0A";

    message +=
    "Subtotal : Rs." +
    subtotal.toLocaleString() +
    "%0A";

    message +=
    "Delivery : Rs." +
    delivery.toLocaleString() +
    "%0A";

    message +=
    "Discount : Rs." +
    discount.toLocaleString() +
    "%0A";

    message +=
    "-------------------------%0A";

    message +=
    "💰 *Grand Total : Rs." +
    grandTotal.toLocaleString() +
    "*";

const whatsappNumber = "94764960463";

const url =
"https://wa.me/" +
whatsappNumber +
"?text=" +
message;

window.open(url, "_blank");



// Clear cart
localStorage.removeItem("cart");

// Optional: remove saved coupon
localStorage.removeItem("coupon");

// Redirect to home page after 1 second
setTimeout(() => {

    window.location.href = "index.html";

}, 4000);
}

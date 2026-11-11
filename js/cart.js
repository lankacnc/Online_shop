// ===============================
// TECH STORE CART SYSTEM
// ===============================


let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Add cart buttons
document.addEventListener(
    "click", 
    function(e){

console.log(e.target);

    if(e.target.closest(".add-cart")){
console.log("Button clicked");



        let button = e.target.closest(".add-cart");

        let product = {

            id: button.dataset.id,

            name: button.dataset.name,

            price: Number(button.dataset.price),

            image: button.dataset.image,

            quantity:quantity

            
        };
        
        console.log( 
            "Product:", 
            product 
        );


        let existing = cart.find(
            item => item.id == product.id
        );


        if(existing){

            existing.quantity += quantity;

        }
        else{

            cart.push(product);

        }


        localStorage.setItem(
            "cart",
            JSON.stringify(cart)
        );


        updateCartCount();


        alert(
            product.name+
            " x " +
            quantity +
            " Added To Cart"
        );


    }

});





// Update cart icon number

function updateCartCount(){

    let count = 0;


    cart.forEach(
        item=>{

        count += item.quantity;

    });


    let cartCount =
    document.querySelector(".cart-count");


    if(cartCount){

        cartCount.innerHTML=count;

    }

}


updateCartCount();

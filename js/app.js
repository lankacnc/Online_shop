const productList = document.getElementById("product-list");

let cart = JSON.parse(localStorage.getItem("cart")) || [];

updateCartCount();

fetch("products.json")
  .then(res => res.json())
  .then(products => {

    products.forEach(product => {

      productList.innerHTML += `
        <div class="card">
          <img src="${product.image}" alt="${product.name}">
          <h3>${product.name}</h3>
          <p>Rs. ${product.price.toLocaleString()}</p>
          <button onclick="addToCart(${product.id})">
            Add to Cart
          </button>
        </div>
      `;

    });

    window.products = products;
  });

function addToCart(id){

  const product = products.find(p => p.id === id);

  const existing = cart.find(item => item.id === id);

  if(existing){
    existing.quantity++;
  }else{
    cart.push({
      ...product,
      quantity: 1
    });
  }

  saveCart();
}

function saveCart(){
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount(){

  const count = cart.reduce(
    (sum,item) => sum + item.quantity,
    0
  );

  const cartCount =
    document.getElementById("cart-count");

  if(cartCount){
    cartCount.textContent = count;
  }
}
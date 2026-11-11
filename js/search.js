const searchInput = document.getElementById("search");
const searchButton = document.getElementById("search-btn");
const productList = document.getElementById("product-list");


// Search products while typing
function searchProducts() {

    const value = searchInput.value.trim().toLowerCase();
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {

        const title = card.querySelector("h3").textContent.toLowerCase();

        if (title.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });
}


// Click Search → filter + scroll + clear
searchButton.addEventListener("click", function() {

    searchProducts();

    productList.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    // Clear search box
    searchInput.value = "";

});


// Press Enter → filter + scroll + clear
searchInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {

        event.preventDefault();

        searchProducts();

        productList.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        // Clear search box
        searchInput.value = "";

    }

});


// Search while typing — no scrolling
searchInput.addEventListener("input", searchProducts);

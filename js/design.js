// ==========================================
// LANKACNC DESIGN LIBRARY - script.js
// ==========================================


// ==========================================
// MOBILE MENU
// ==========================================

const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {

    menuToggle.addEventListener("click", function () {

        mainNav.classList.toggle("active");

        // Change menu icon
        if (mainNav.classList.contains("active")) {
            menuToggle.innerHTML = "✕";
        } else {
            menuToggle.innerHTML = "☰";
        }

    });

}


// ==========================================
// SEARCH DESIGNS + PAGINATION
// ==========================================

const searchInput = document.getElementById("searchInput");
const designGrid = document.getElementById("designGrid");
const noResults = document.getElementById("noResults");

const paginationWrapper = document.getElementById("paginationWrapper");
const paginationInfo = document.getElementById("paginationInfo");
const pageNumbers = document.getElementById("pageNumbers");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");

const ITEMS_PER_PAGE = 12;
let currentPage = 1;
let filteredCards = [];

if (designGrid) {

    const allDesignCards = Array.from(
        designGrid.querySelectorAll(".design-card")
    );


    // ==========================================
    // GET FILTERED DESIGN CARDS
    // ==========================================

    function getFilteredCards() {

        const searchText = searchInput
            ? searchInput.value.toLowerCase().trim()
            : "";


        // If search box is empty,
        // return all design cards.
        if (!searchText) {
            return allDesignCards;
        }


        // Search through design cards.
        return allDesignCards.filter(function (card) {

            const title = card.dataset.title || "";

            const description =
                card.dataset.description || "";

            const tags =
                card.dataset.tags || "";

            const fileType =
                card.dataset.fileType || "";


            const searchableText = (
                title + " " +
                description + " " +
                tags + " " +
                fileType
            ).toLowerCase();


            return searchableText.includes(searchText);

        });

    }


    const tagFilter = document.getElementById("tagFilter");
const fileTypeFilter = document.getElementById("fileTypeFilter");

function filterDesigns() {

    const selectedTag = tagFilter.value.toLowerCase();
    const selectedFileType = fileTypeFilter.value.toLowerCase();

    const cards = document.querySelectorAll(".design-card");

    cards.forEach(card => {

        const tags = (card.dataset.tags || "").toLowerCase();
        const fileType = (card.dataset.fileType || "").toLowerCase();

        const tagMatch =
            selectedTag === "all" ||
            tags === selectedTag;

        const fileTypeMatch =
            selectedFileType === "all" ||
            fileType === selectedFileType;

        if (tagMatch && fileTypeMatch) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }

    });
}

tagFilter.addEventListener("change", filterDesigns);
fileTypeFilter.addEventListener("change", filterDesigns);
    

    // ==========================================
    // CREATE PAGE NUMBER BUTTON
    // ==========================================

    function createPageButton(page, label = page) {

        const button = document.createElement("button");

        button.type = "button";

        button.className = "page-number";

        button.textContent = label;

        button.setAttribute(
            "aria-label",
            "Page " + page
        );


        // Mark current page as active.
        if (page === currentPage) {

            button.classList.add("active");

            button.setAttribute(
                "aria-current",
                "page"
            );

        }


        // When page number is clicked.
        button.addEventListener("click", function () {

            currentPage = page;

            renderPagination();


            // Scroll back to design grid.
            window.scrollTo({

                top: designGrid.offsetTop - 90,

                behavior: "smooth"

            });

        });


        return button;

    }


    // ==========================================
    // ADD ELLIPSIS (...)
    // ==========================================

    function addEllipsis() {

        const span = document.createElement("span");

        span.className = "ellipsis";

        span.textContent = "…";

        pageNumbers.appendChild(span);

    }


    // ==========================================
    // CREATE PAGE NUMBERS
    // ==========================================

    function renderPageNumbers(totalPages) {

        // Clear existing page numbers.
        pageNumbers.innerHTML = "";


        // No need for page numbers
        // when there is only one page.
        if (totalPages <= 1) {
            return;
        }


        // If there are 5 or fewer pages,
        // show every page number.
        if (totalPages <= 5) {

            for (
                let page = 1;
                page <= totalPages;
                page++
            ) {

                pageNumbers.appendChild(
                    createPageButton(page)
                );

            }

            return;
        }


        // ==========================================
        // ALWAYS SHOW FIRST PAGE
        // ==========================================

        pageNumbers.appendChild(
            createPageButton(1)
        );


        // Add "..." if needed.
        if (currentPage > 3) {

            addEllipsis();

        }


        // Calculate middle page numbers.
        const startPage = Math.max(
            2,
            currentPage - 1
        );

        const endPage = Math.min(
            totalPages - 1,
            currentPage + 1
        );


        // Create middle page buttons.
        for (
            let page = startPage;
            page <= endPage;
            page++
        ) {

            pageNumbers.appendChild(
                createPageButton(page)
            );

        }


        // Add "..." before last page if needed.
        if (currentPage < totalPages - 2) {

            addEllipsis();

        }


        // ==========================================
        // ALWAYS SHOW LAST PAGE
        // ==========================================

        pageNumbers.appendChild(
            createPageButton(totalPages)
        );

    }


    // ==========================================
    // MAIN PAGINATION FUNCTION
    // ==========================================

    function renderPagination() {

        // Get cards matching current search.
        filteredCards = getFilteredCards();


        // Total number of matching cards.
        const totalItems = filteredCards.length;


        // Calculate total pages.
        const totalPages = Math.ceil(
            totalItems / ITEMS_PER_PAGE
        );


        // ==========================================
        // NO RESULTS
        // ==========================================

        if (totalItems === 0) {

            // Hide every design card.
            allDesignCards.forEach(function (card) {

                card.style.display = "none";

            });


            // Show "No results".
            if (noResults) {

                noResults.style.display = "block";

            }


            // Hide pagination.
            if (paginationWrapper) {

                paginationWrapper.style.display = "none";

            }


            return;

        }


        // Hide "No results".
        if (noResults) {

            noResults.style.display = "none";

        }


        // ==========================================
        // KEEP CURRENT PAGE VALID
        // ==========================================

        currentPage = Math.min(
            Math.max(currentPage, 1),
            totalPages
        );


        // ==========================================
        // CALCULATE START AND END ITEMS
        // ==========================================

        const startIndex =
            (currentPage - 1) * ITEMS_PER_PAGE;


        const endIndex = Math.min(

            startIndex + ITEMS_PER_PAGE,

            totalItems

        );


        // ==========================================
        // GET CARDS FOR CURRENT PAGE
        // ==========================================

        const visibleCards = new Set(

            filteredCards.slice(
                startIndex,
                endIndex
            )

        );


        // ==========================================
        // SHOW / HIDE CARDS
        // ==========================================

        allDesignCards.forEach(function (card) {

            card.style.display =
                visibleCards.has(card)
                    ? ""
                    : "none";

        });


        // ==========================================
        // SHOW / HIDE PAGINATION
        // ==========================================

        if (paginationWrapper) {

            paginationWrapper.style.display =
                totalItems > ITEMS_PER_PAGE
                    ? "flex"
                    : "none";

        }


        // ==========================================
        // UPDATE ITEM COUNT
        // ==========================================

        if (paginationInfo) {

            paginationInfo.textContent =
                `Showing ${startIndex + 1} - ${endIndex} of ${totalItems} items`;

        }


        // ==========================================
        // PREVIOUS BUTTON
        // ==========================================

        if (prevPage) {

            prevPage.disabled =
                currentPage === 1;

        }


        // ==========================================
        // NEXT BUTTON
        // ==========================================

        if (nextPage) {

            nextPage.disabled =
                currentPage === totalPages;

        }


        // ==========================================
        // UPDATE PAGE NUMBERS
        // ==========================================

        renderPageNumbers(totalPages);

    }


    // ==========================================
    // SEARCH INPUT
    // ==========================================

    if (searchInput) {

        searchInput.addEventListener(
            "input",
            function () {

                // Start from page 1
                // whenever a new search is made.
                currentPage = 1;

                renderPagination();

            }
        );

    }


    // ==========================================
    // PREVIOUS BUTTON
    // ==========================================

    if (prevPage) {

        prevPage.addEventListener(
            "click",
            function () {

                if (currentPage > 1) {

                    currentPage--;

                    renderPagination();


                    // Scroll back to design grid.
                    window.scrollTo({

                        top:
                            designGrid.offsetTop - 90,

                        behavior: "smooth"

                    });

                }

            }
        );

    }


    // ==========================================
    // NEXT BUTTON
    // ==========================================

    if (nextPage) {

        nextPage.addEventListener(
            "click",
            function () {

                const totalPages =
                    Math.ceil(
                        filteredCards.length /
                        ITEMS_PER_PAGE
                    );


                if (currentPage < totalPages) {

                    currentPage++;

                    renderPagination();


                    // Scroll back to design grid.
                    window.scrollTo({

                        top:
                            designGrid.offsetTop - 90,

                        behavior: "smooth"

                    });

                }

            }
        );

    }


    // ==========================================
    // INITIALIZE PAGINATION
    // ==========================================

    renderPagination();

}


// ==========================================
// FILE TYPE BADGES
// ==========================================

const fileBadges =
    document.querySelectorAll(
        "[data-file-badge]"
    );


fileBadges.forEach(function (badge) {

    const fileType =
        badge.textContent
            .trim()
            .toUpperCase();


    badge.textContent = fileType;


    // Add class based on file type.
    badge.classList.add(
        "file-" +
        fileType.toLowerCase()
    );

});


// ==========================================
// DOWNLOAD BUTTON - SIGN IN REQUIRED
// ==========================================

const downloadButtons =
    document.querySelectorAll(
        ".download-btn"
    );


downloadButtons.forEach(function (button) {

    button.addEventListener(
        "click",
        function (e) {


            // ==========================================
            // CHECK EXISTING LOGIN SESSION
            // ==========================================

            const sessionToken =
                localStorage.getItem(
                    "sessionToken"
                );


            const user =
                localStorage.getItem(
                    "user"
                );


            // ==========================================
            // NOT SIGNED IN
            // ==========================================

            if (!sessionToken || !user) {

                e.preventDefault();


                // Remember current design page.
                localStorage.setItem(
                    "downloadReturnUrl",
                    window.location.href
                );


                alert(
                    "Please sign in to download designs."
                );


                // Go to sign-in page.
                window.location.href =
                    "signin.html";


                return;

            }


            // ==========================================
            // SIGNED IN
            // ==========================================

            console.log(
                "Downloading design:",
                button.getAttribute("href")
            );


            // Do NOT prevent default action.
            // Download continues normally.

        }
    );

});


// ==========================================
// CLOSE MOBILE MENU WHEN LINK IS CLICKED
// ==========================================

const navLinks =
    document.querySelectorAll(
        ".main-nav a"
    );


navLinks.forEach(function (link) {

    link.addEventListener(
        "click",
        function () {


            if (mainNav) {

                mainNav.classList.remove(
                    "active"
                );

            }


            if (menuToggle) {

                menuToggle.innerHTML = "☰";

            }

        }
    );

});


// ==========================================
// IMAGE ERROR HANDLING
// ==========================================

const designImages =
    document.querySelectorAll(
        ".design-image img"
    );


designImages.forEach(function (image) {

    image.addEventListener(
        "error",
        function () {

            console.log(
                "Image could not be loaded:",
                image.src
            );


            image.style.display = "none";

        }
    );

});

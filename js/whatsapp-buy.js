
// ==========================================
// LANKACNC - WHATSAPP BUY DESIGN SYSTEM
// ==========================================

document.addEventListener("DOMContentLoaded", function () {

    const whatsappNumber = "94764960463";

    const buyButtons = document.querySelectorAll(".Buy-btn");

    buyButtons.forEach(function (button) {

        button.addEventListener("click", function (event) {

            event.preventDefault();

            // Find the design card
            const card = button.closest(".design-card");

            if (!card) {
                console.error("Design card not found.");
                return;
            }

            // Get design information
            const title =
                card.dataset.title ||
                card.querySelector("h2")?.textContent.trim() ||
                "Design";

            const fileType =
                card.dataset.fileType ||
                card.querySelector("[data-file-badge]")?.textContent.trim() ||
                "N/A";

            const priceElement =
                card.querySelector(".design-price");

            const price =
                priceElement
                    ? priceElement.textContent.trim()
                    : "Price not specified";

            // Get design category
            const categoryElement =
                card.querySelector(".tags span:nth-child(2)");

            const category =
                categoryElement
                    ? categoryElement.textContent.trim()
                    : "3D Design";

            // Create WhatsApp message
            const message =
`Hello LankaCNC,

I want to buy this design.

Design Name: ${title}
File Type: ${fileType}
Category: ${category}
Price: ${price}

Please send me the payment details and download information.

Thank you.`;

            // Encode message for WhatsApp
            const encodedMessage =
                encodeURIComponent(message);

            // WhatsApp URL
            const whatsappURL =
                `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

            // Open WhatsApp
            window.open(
                whatsappURL,
                "_blank",
                "noopener,noreferrer"
            );

        });

    });

});

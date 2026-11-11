
const form = document.getElementById("signin-form");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const password = document.getElementById("password").value;
        const button = form.querySelector("button[type='submit']");

        if (!email || !password) {
            alert("Please enter your email and password.");
            return;
        }

        // Save original button content
        button.dataset.originalText = button.innerHTML;

        // Start loading
        button.disabled = true;
        button.innerHTML = `
            <span class="login-spinner"></span>
            <span>Signing In...</span>
        `;

        try {
            const result = await authRequest("signin", { email, password });

            if (!result.success) {
                // Stop loading immediately
                button.disabled = false;
                button.innerHTML = button.dataset.originalText;

                alert(result.message || "Invalid email or password.");

                document.getElementById("password").value = "";
                document.getElementById("password").focus();

                return;
            }

            saveSession(result.sessionToken);
            localStorage.setItem("user", JSON.stringify(result.user));

            // Check if user was trying to download a design
            const returnUrl = localStorage.getItem("downloadReturnUrl");

            if (returnUrl) {
                localStorage.removeItem("downloadReturnUrl");
                window.location.href = returnUrl;
            } else {
                window.location.href = "index.html";
            }

        } catch (error) {
            console.error(error);

            // Stop loading if server/network error occurs
            button.disabled = false;
            button.innerHTML = button.dataset.originalText;

            alert("Could not connect to the authentication server. Please try again.");

        } finally {
            // Make sure loading is stopped
            button.disabled = false;

            if (button.dataset.originalText) {
                button.innerHTML = button.dataset.originalText;
            }
        }
    });
}

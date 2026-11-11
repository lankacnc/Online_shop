const form = document.getElementById("reset-password-form");

const params = new URLSearchParams(window.location.search);
const email = params.get("email");
const token = params.get("token");

if (!email || !token) {
    alert("This password reset link is invalid or incomplete.");
    window.location.replace("signin.html");
} else if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;
        const button = form.querySelector("button[type='submit']");

        if (password.length < 8) {
            alert("Password must be at least 8 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match.");
            return;
        }

        button.disabled = true;

        try {
            const result = await authRequest("resetPassword", {
                email,
                token,
                password
            });

            if (!result.success) {
                alert(result.message || "This reset link is invalid or expired.");
                return;
            }

            // A reset link is single-use; remove it from the address bar after success.
            alert("Password changed successfully. You can now sign in.");
            window.location.replace("signin.html");
        } catch (error) {
            console.error(error);
            alert("Could not connect to the authentication server. Please try again.");
        } finally {
            button.disabled = false;
        }
    });
}

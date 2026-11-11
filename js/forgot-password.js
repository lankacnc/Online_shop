const form = document.getElementById("forgot-password-form");

if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("email").value.trim().toLowerCase();
        const button = form.querySelector("button[type='submit']");

        if (!email) {
            alert("Please enter your email address.");
            return;
        }

        button.disabled = true;

        try {
            const result = await authRequest("forgotPassword", { email });

            // Always show the same message to avoid revealing whether an account exists.
            alert(
                result.message ||
                "If an account exists for this email, a password reset link has been sent. Please check your email."
            );

            form.reset();
        } catch (error) {
            console.error(error);
            alert("Could not connect to the authentication server. Please try again.");
        } finally {
            button.disabled = false;
        }
    });
}

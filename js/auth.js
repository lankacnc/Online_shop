(async function initAuth() {
    const userStatus = document.getElementById("user-status");
    const logoutBtn = document.getElementById("logout-btn");
    const signinLink = document.getElementById("signin-link");
    const token = getSessionToken();

    if (!token) {
        if (logoutBtn) logoutBtn.style.display = "none";
        return;
    }

    try {
        const result = await authRequest("me", { sessionToken: token });

        if (!result.success || !result.user) {
            clearSession();
            return;
        }

        localStorage.setItem("user", JSON.stringify(result.user));

        if (userStatus) userStatus.textContent = `Welcome, ${result.user.name}`;
        if (logoutBtn) logoutBtn.style.display = "flex";
        if (signinLink) signinLink.style.display = "none";
    } catch (error) {
        console.error("Authentication check failed:", error);
        // Do not automatically log the user out just because the network is temporarily down.
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                if (getSessionToken()) {
                    await authRequest("logout", { sessionToken: getSessionToken() });
                }
            } catch (error) {
                console.error("Logout request failed:", error);
            } finally {
                clearSession();
                window.location.href = "index.html";
            }
        });
    }
})();

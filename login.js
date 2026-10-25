const loginBtn = document.getElementById("loginBtn");
const message = document.getElementById("message");

loginBtn.addEventListener("click", async function () {

    console.log("Login button clicked");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
        message.textContent = "❌ Email और Password डालें";
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = "Logging in...";
    message.textContent = "";

    try {

        const response = await fetch("/api/auth/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log("Login Response:", data);

        if (!response.ok) {
            message.textContent =
                "❌ " + (data.message || "Login failed");
            return;
        }

        if (!data.token) {
            message.textContent =
                "❌ Login हुआ लेकिन token नहीं मिला";
            return;
        }

        localStorage.setItem("token", data.token);

        if (data.user) {
            localStorage.setItem(
                "user",
                JSON.stringify(data.user)
            );
        }

        console.log(
            "Token saved:",
            localStorage.getItem("token")
        );

        message.textContent = "✅ Login successful";

        window.location.href = "/index.html";

    } catch (error) {

        console.error("Login Error:", error);

        message.textContent =
            "❌ Server से connection नहीं हुआ";

    } finally {

        loginBtn.disabled = false;
        loginBtn.textContent = "Login";
    }
});
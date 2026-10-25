 const signupBtn = document.getElementById("signupBtn");
const message = document.getElementById("message");

signupBtn.addEventListener("click", async function () {

    console.log("Signup button clicked");

    const name = document
        .getElementById("name")
        .value
        .trim();

    const email = document
        .getElementById("email")
        .value
        .trim();

    const password = document
        .getElementById("password")
        .value;

    if (!name || !email || !password) {
        message.textContent = "❌ सभी fields भरें";
        return;
    }

    if (password.length < 8) {
        message.textContent =
            "❌ Password कम से कम 8 characters का होना चाहिए";
        return;
    }

    signupBtn.disabled = true;
    signupBtn.textContent = "Signing up...";
    message.textContent = "";

    try {

        const response = await fetch("/api/auth/signup", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                name: name,
                email: email,
                password: password
            })
        });

        const data = await response.json();

        console.log("Signup Response:", data);

        if (!response.ok) {
            message.textContent =
                "❌ " + (data.message || "Signup failed");

            return;
        }

        message.textContent = "✅ Signup successful";

        setTimeout(() => {
            window.location.href = "/login.html";
        }, 1000);

    } catch (error) {

        console.error("Signup Error:", error);

        message.textContent =
            "❌ Server से connection नहीं हुआ";

    } finally {

        signupBtn.disabled = false;
        signupBtn.textContent = "Signup";
    }
});
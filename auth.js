 async function signup() {

    const name =
        document.getElementById("name").value;

    const email =
        document.getElementById("signupEmail").value;

    const password =
        document.getElementById("signupPassword").value;


    const response = await fetch("/api/auth/signup", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            name,
            email,
            password
        })
    });


    const data = await response.json();

    document.getElementById("message")
        .innerText = data.message;
}


async function login() {

    const email =
        document.getElementById("email").value;

    const password =
        document.getElementById("password").value;


    const response = await fetch("/api/auth/login", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({
            email,
            password
        })
    });


    const data = await response.json();


    if (data.token) {

        localStorage.setItem(
            "token",
            data.token
        );

        localStorage.setItem(
            "user",
            JSON.stringify(data.user)
        );

        window.location.href = "/index.html";

    } else {

        document.getElementById("message")
            .innerText = data.message;
    }
}


function showSignup() {

    document.getElementById("signupBox")
        .style.display = "block";
}
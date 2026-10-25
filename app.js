 let currentChatId = null;
let sendingMessage = false;

// ===============================
// Elements
// ===============================

const messageInput =
    document.getElementById("messageInput");

const sendBtn =
    document.getElementById("sendBtn");

const messages =
    document.getElementById("messages");

const newChatBtn =
    document.getElementById("newChatBtn");

const chatHistory =
    document.getElementById("chatHistory");

const logoutBtn =
    document.getElementById("logoutBtn");


// ===============================
// Check Login
// ===============================

const token =
    localStorage.getItem("token");

if (!token) {
    window.location.href = "/login.html";
}


// ===============================
// New Chat
// ===============================

newChatBtn.addEventListener("click", () => {

    currentChatId = null;

    console.log(
        "New Chat started. Chat ID:",
        currentChatId
    );

    messages.innerHTML = `
        <div class="welcome">
            <h1>👋 New Chat</h1>
            <p>Aap apna question pooch sakte hain.</p>
        </div>
    `;

    messageInput.value = "";

    messageInput.focus();
});


// ===============================
// Send Button
// ===============================

sendBtn.addEventListener(
    "click",
    sendMessage
);


// ===============================
// Enter Key
// ===============================

messageInput.addEventListener(
    "keydown",
    (event) => {

        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {

            event.preventDefault();

            if (!sendingMessage) {
                sendMessage();
            }
        }
    }
);


// ===============================
// Send Message
// ===============================

async function sendMessage() {

    if (sendingMessage) {
        return;
    }

    const message =
        messageInput.value.trim();

    if (!message) {
        return;
    }

    sendingMessage = true;

    sendBtn.disabled = true;

    // ===========================
    // IMPORTANT
    // ===========================

    console.log(
        "Sending Message:",
        message
    );

    console.log(
        "Sending Chat ID:",
        currentChatId
    );


    // ===========================
    // Show User Message
    // ===========================

    addMessage(
        "user",
        message
    );

    messageInput.value = "";


    // ===========================
    // Loading
    // ===========================

    const loading =
        addMessage(
            "assistant",
            "Thinking..."
        );


    try {

        // ===========================
        // API Request
        // ===========================

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Bearer ${token}`
                    },

                    body: JSON.stringify({

                        message: message,

                        chatId:
                            currentChatId

                    })
                }
            );


        const data =
            await response.json();


        console.log(
            "AI Response:",
            data
        );


        // ===========================
        // API Error
        // ===========================

        if (!response.ok) {

            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                alert(
                    "Your login session has expired. Please login again."
                );

                window.location.href =
                    "/login.html";

                return;
            }


            throw new Error(
                data.message ||
                data.error ||
                "AI server error"
            );
        }


        // ===========================
        // Remove Loading
        // ===========================

        loading.remove();


        // ===========================
        // AI Answer
        // ===========================

        addMessage(
            "assistant",
            data.answer ||
            data.reply ||
            "AI ने कोई जवाब नहीं दिया।"
        );


        // ===========================
        // VERY IMPORTANT
        // Chat ID Update
        // ===========================

        if (data.chatId) {

            currentChatId =
                String(data.chatId);

            console.log(
                "Current Chat ID Updated:",
                currentChatId
            );

        } else {

            console.error(
                "❌ Server ने chatId नहीं भेजा!"
            );

        }


        // ===========================
        // Load History
        // ===========================

        await loadChatHistory();


    } catch (error) {

        console.error(
            "Chat Error:",
            error
        );


        loading.remove();


        addMessage(
            "assistant",
            "❌ Error: " +
            error.message
        );

    } finally {

        sendingMessage = false;

        sendBtn.disabled = false;

        messageInput.focus();

    }
}


// ===============================
// Add Message
// ===============================

function addMessage(
    role,
    content
) {

    const div =
        document.createElement("div");

    div.className =
        `message ${role}`;

    div.textContent =
        content;

    messages.appendChild(div);

    messages.scrollTop =
        messages.scrollHeight;

    return div;
}


// ===============================
// Load Chat History
// ===============================

async function loadChatHistory() {

    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    },

                    cache: "no-store"
                }
            );


        const data =
            await response.json();


        console.log(
            "Chat History Response:",
            data
        );


        // ===========================
        // Error
        // ===========================

        if (!response.ok) {

            if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "token"
                );

                localStorage.removeItem(
                    "user"
                );

                window.location.href =
                    "/login.html";

                return;
            }


            console.error(
                "History API Error:",
                data
            );

            return;
        }


        // ===========================
        // Chats
        // ===========================

        const chats =
            data.chats;


        if (!Array.isArray(chats)) {

            console.error(
                "❌ Chats array नहीं मिली"
            );

            return;
        }


        console.log(
            "Chats Found:",
            chats.length
        );


        // ===========================
        // Clear History
        // ===========================

        chatHistory.innerHTML = "";


        // ===========================
        // Display Chats
        // ===========================

        chats.forEach(
            (chat) => {

                const div =
                    document.createElement(
                        "div"
                    );

                div.className =
                    "history-item";


                // Title

                const title =
                    document.createElement(
                        "span"
                    );

                title.textContent =
                    chat.title ||
                    "New Chat";


                title.addEventListener(
                    "click",
                    () => {

                        openChat(chat);

                    }
                );


                // Delete

                const deleteButton =
                    document.createElement(
                        "button"
                    );

                deleteButton.className =
                    "delete-btn";

                deleteButton.textContent =
                    "🗑️";


                deleteButton.addEventListener(
                    "click",
                    (event) => {

                        event.stopPropagation();

                        deleteChat(
                            chat._id
                        );

                    }
                );


                div.appendChild(title);

                div.appendChild(
                    deleteButton
                );

                chatHistory.appendChild(
                    div
                );

            }
        );


        console.log(
            "Chat History UI updated:",
            chatHistory.children.length
        );

    } catch (error) {

        console.error(
            "History Error:",
            error
        );
    }
}


// ===============================
// Open Chat
// ===============================

function openChat(chat) {

    currentChatId =
        String(chat._id);


    console.log(
        "Opened Chat ID:",
        currentChatId
    );


    messages.innerHTML = "";


    if (
        !chat.messages ||
        !Array.isArray(
            chat.messages
        )
    ) {

        return;
    }


    chat.messages.forEach(
        (message) => {

            addMessage(
                message.role,
                message.content
            );

        }
    );
}


// ===============================
// Delete Chat
// ===============================

async function deleteChat(
    chatId
) {

    const confirmDelete =
        confirm(
            "Kya aap is chat ko delete karna chahte hain?"
        );


    if (!confirmDelete) {
        return;
    }


    try {

        const response =
            await fetch(
                `/api/chat/${chatId}`,
                {
                    method: "DELETE",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message ||
                data.error ||
                "Delete failed"
            );
        }


        // ===========================
        // Reset Current Chat
        // ===========================

        if (
            String(currentChatId) ===
            String(chatId)
        ) {

            currentChatId = null;

            messages.innerHTML = `
                <div class="welcome">
                    <h1>👋 New Chat</h1>
                    <p>Aap apna question pooch sakte hain.</p>
                </div>
            `;
        }


        // ===========================
        // Reload History
        // ===========================

        await loadChatHistory();

    } catch (error) {

        console.error(
            "Delete Error:",
            error
        );

        alert(
            "❌ " +
            error.message
        );
    }
}


// ===============================
// Logout
// ===============================

logoutBtn.addEventListener(
    "click",
    () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "/login.html";
    }
);


// ===============================
// Start App
// ===============================

loadChatHistory();
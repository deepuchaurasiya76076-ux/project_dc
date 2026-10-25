require('dotenv').config();
const express = require("express");
const OpenAI = require("openai");

const Chat = require("../models/chat");
const authMiddleware = require("../middlewere/auth");

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// Send AI message
router.post("/", authMiddleware, async (req, res) => {

    try {

        const { message, chatId } = req.body;

        if (!message) {
            return res.status(400).json({
                message: "Message required"
            });
        }


        // Find user's existing chat
        let chat;

        if (chatId) {

            chat = await Chat.findOne({
                _id: chatId,
                userId: req.userId
            });

        }


        // Create new chat
        if (!chat) {

            chat = await Chat.create({
                userId: req.userId,
                title: message.substring(0, 30),
                messages: []
            });

        }


        // Save user message
        chat.messages.push({
            role: "user",
            content: message
        });


        // AI request
        const response = await openai.responses.create({

            model: "gpt-5.5",

            input: message

        });


        const answer = response.output_text;


        // Save AI answer
        chat.messages.push({
            role: "assistant",
            content: answer
        });


        await chat.save();


        res.json({
            chatId: chat._id,
            answer
        });


    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "AI server error"
        });

    }

});


// Get user's chat history
router.get("/", authMiddleware, async (req, res) => {

    try {

        const chats = await Chat.find({
            userId: req.userId
        })
        .sort({ createdAt: -1 });

        res.json(chats);

    } catch (error) {

        res.status(500).json({
            message: "Could not load chats"
        });

    }

});


// Delete user's chat
router.delete("/:id", authMiddleware, async (req, res) => {

    try {

        const deletedChat = await Chat.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });


        if (!deletedChat) {

            return res.status(404).json({
                message: "Chat not found"
            });

        }


        res.json({
            message: "Chat deleted successfully"
        });

    } catch (error) {

        res.status(500).json({
            message: "Delete failed"
        });

    }

});


module.exports = router;
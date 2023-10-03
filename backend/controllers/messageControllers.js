const asyncHandler = require("express-async-handler");
const Message = require("../models/messageModel");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const sendMessage = asyncHandler(async (req, res) => {
    const { content, chatId } = req.body
    // await Message.deleteMany()

    if (!content || !chatId) {
        console.log('Invalid data passed into request');
        res.status(400)
    }

    var newMessage = {
        sender: req.user._id,
        content: content,
        chat: chatId
    }

    try {
        var message = await Message.create(newMessage)

        message = await message.populate("sender", "username pics")
        message = await message.populate("chat")
        message = await User.populate(message, {
            path: "chat.users",
            select: "username pics email"
        })

        await Chat.findByIdAndUpdate(chatId, {
            latestMessage: message
        })

        res.json(message)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const allMessages = asyncHandler(async (req, res) => {
    try {
        const message = await Message.find({ chat: req.params.chatId }).populate("sender", "username pics email").populate("chat")
        res.json(message)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }

})

module.exports = { sendMessage, allMessages }


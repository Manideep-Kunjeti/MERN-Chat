const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Chat = require("../models/chatModel");

const accessChat = asyncHandler(async (req, res) => {
    const { userId } = req.body

    if (!userId) {
        console.log('userId param not sent with the request')
        return res.sendStatus(400)
    }

    try {
        var isChat = await Chat.find({
            isGroupChat: false,
            $and: [
                { users: { $elemMatch: { $eq: req.user._id } } }, //id of the logged in user
                { users: { $elemMatch: { $eq: userId } } } //userId for which you want to create chat
            ]
        }).populate('users', '-Password').populate('latestMessage')

        isChat = await User.populate(isChat, {
            path: 'latestMessage.sender',
            select: 'username pics email'
        })
    } catch (error) {
        res.status(400)
        res.send('UserId doesnt exist')
    }

    if (isChat.length > 0) {
        res.status(202)
        res.send(isChat[0])
    }
    else {
        var chatData = {
            chatName: "sender",
            isGroupChat: false,
            users: [req.user._id, userId]
        }

        try {
            const createdChat = await Chat.create(chatData)

            const FullChat = await Chat.findOne({ _id: createdChat._id }).populate('users', '-Password')
            res.status(200)
            res.send(FullChat)
        } catch (error) {
            res.status(400)
            throw new Error(error.message)
        }
    }
})

const fetchChats = asyncHandler(async (req, res) => {
    try {
        Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
            .populate('users', '-Password')
            .populate('latestMessage')
            .populate('groupAdmin', '-Password')
            .sort({ updatedAt: -1 })
            .then(async (results) => {
                results = await User.populate(results, {
                    path: 'latestMessage.sender',
                    select: 'username, pics, email'
                })
                res.status(200)
                res.send(results)
            })
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }

})

const createGroupChat = asyncHandler(async (req, res) => {
    var { chatName, users } = req.body;
    if (!chatName || !users)
        return res.status(400).send('Please fill all the fields')

    users = JSON.parse(users)
    if (users.length < 2)
        return res.status(400).send('More than 2 users are required to create a Group')

    users.push(req.user._id)
    try {
        const groupChat = await Chat.create({
            chatName: chatName, //req.body.chatName
            isGroupChat: true,
            users: users, //parsed req.body.users and pushed user logged in(admin)
            groupAdmin: req.user._id
        })

        const fullGroupChat = await Chat.find({ _id: groupChat._id })
            .populate('users', '-Password')
            .populate('groupAdmin', '-Password')

        res.status(200).send(fullGroupChat)
    } catch (error) {
        res.status(400)
        throw new Error(error.message)
    }
})

const renameChat = asyncHandler(async (req, res) => {
    const { chatId, chatName } = req.body

    const updatedChat = await Chat.findByIdAndUpdate(
        chatId,
        { chatName: chatName },
        { new: true }
    ).populate('users', '-Password')
        .populate('groupAdmin', '-Password')

    if (!updatedChat) {
        res.status(404)
        throw new Error('Chat not found')
    } else res.send(updatedChat)
})

const addToGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    const added = await Chat.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    ).populate('users', '-Password')
        .populate('groupAdmin', '-Password')

    if (!added) {
        res.status(404)
        throw new Error('Chat not found')
    } else res.send(added)
})

const removeFromGroup = asyncHandler(async (req, res) => {
    const { chatId, userId } = req.body

    const removed = await Chat.findByIdAndUpdate(
        chatId,
        { $pull: { users: userId } },
        { new: true }
    ).populate('users', '-Password')
        .populate('groupAdmin', '-Password')

    if (!removed) {
        res.status(404)
        throw new Error('Chat not found')
    } else res.send(removed)
})

module.exports = { accessChat, fetchChats, createGroupChat, renameChat, addToGroup, removeFromGroup }
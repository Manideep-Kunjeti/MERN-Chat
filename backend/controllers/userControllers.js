const asyncHandler = require("express-async-handler")
const User = require("../models/userModel")
const generateToken = require("../config/generateToken")

const registerUser = asyncHandler(async (req, res) => {
    // await User.deleteMany()
    const { username, email, Password, pics } = req.body //Getting from signup.js

    if (!username || !email || !Password) {
        res.status(400)
        throw new Error('Please enter all fields')
    }

    const userExists = await User.findOne({ email })
    if (userExists) {
        res.status(400)
        throw new Error("User already exists")
    }

    // console.log('=========')
    const user = await User.create({
        username,
        email,
        Password,
        pics
    })
    // console.log(user)
    if (user) {
        res.status(201).json({
            _id: user._id,
            name: user.username,
            password: user.Password,
            email: user.email,
            pic: user.pics,
            token: generateToken(user._id)
        })
    } else {
        res.status(400)
        throw new Error('Failes to create a new User')
    }
})

const authUser = asyncHandler(async (req, res) => {
    const { email, Password } = req.body;
    const user = await User.findOne({ email })

    if (user && (await user.matchPassword(Password))) {
        res.json({
            _id: user._id,
            name: user.username,
            email: user.email,
            token: generateToken(user._id),
            pic: user.pics
        })
    } else {
        res.status(401)
        throw new Error('Invalid Email or Password')
    }
})

// /api/user?search=mani
const allUsers = asyncHandler(async (req, res) => {
    const keyword = req.query.search ? {
        $or: [
            { username: { $regex: req.query.search, $options: 'i' } },
            { email: { $regex: req.query.search, $options: 'i' } }
        ]
    } : {}

    const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
    res.send(users)
})

// const onlyReqUsers = asyncHandler(async (req, res) => {
//     const keyword = req.query.search ? {
//         $or: [
//             { username: { $regex: req.query.search, $options: 'i' } },
//             { email: { $regex: req.query.search, $options: 'i' } }
//         ]
//     } : {}

//     const users = await User.find(keyword).find({ _id: { $ne: req.user._id } })
//     res.send(users)
// })



module.exports = { registerUser, authUser, allUsers }
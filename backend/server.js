const express = require("express")
const dotenv = require("dotenv")
const chats = require("./data/data")
const connectDB = require("./config/db")
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const messageRoutes = require('./routes/messageRoutes')
const { notFound, errorHandler } = require("./middlewares/errorMiddlewares")
const path = require('path')

dotenv.config()
connectDB()

const app = express()
app.use(express.json()) //To accept JSON Data from frontend



app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)

//Deployment
const __dirname1 = path.resolve()
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname1, '/frontend/build')))
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname1, "frontend", "build", "index.html"))
    })
} else {
    app.get("/", (req, res) => {
        res.send("API is running")
    })
}

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
const server = app.listen(PORT, console.log(`Server started on PORT ${PORT}`))

const io = require('socket.io')(server, {
    pingTimeout: 60000,
    cors: {
        origin: 'http://localhost:3000'
    }
})

io.on("connection", (socket) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData) => {
        socket.join(userData._id)
        // console.log(userData._id)
        socket.emit('connected')
    })

    socket.on('join chat', (room) => {
        socket.join(room)
        console.log('user joined room ' + room)
    })

    //when user types message and press enter, this socket receives 
    //called from sendMessage from singleChat
    socket.on('send message', (newMessageReceived) => {
        var chat = newMessageReceived.chat

        if (!chat.users)
            return console.log('chat.users not defined')

        chat.users.forEach((user) => {
            if (user._id === newMessageReceived.sender._id)
                return
            socket.in(user._id).emit('message received', newMessageReceived)
        });
    })

    socket.on('typing', (room) => {
        socket.in(room).emit("typing")
    })

    socket.on('stop typing', (room) => {
        socket.in(room).emit('stop typing')
    })

    socket.off('setup', () => {
        console.log('user disconnected')
        socket.leave(userData._id)
    })
})
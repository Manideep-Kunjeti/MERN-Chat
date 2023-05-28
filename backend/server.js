const express = require("express")
const dotenv = require("dotenv")
const chats = require("./data/data")
const connectDB = require("./config/db")
const userRoutes = require('./routes/userRoutes')
const chatRoutes = require('./routes/chatRoutes')
const { notFound, errorHandler } = require("./middlewares/errorMiddlewares")

dotenv.config()
connectDB()

const app = express()
app.use(express.json()) //To accept JSON Data from frontend

app.get("/", (req, res) => {
    res.send("API is running")
})

app.use('/api/user', userRoutes)
app.use('/api/chat', chatRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 5000
app.listen(PORT, console.log(`Server started on PORT ${PORT}`))
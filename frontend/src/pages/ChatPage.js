import React, { useEffect, useState } from 'react'
import axios from 'axios'

const ChatPage = () => {

    const [chats, setChats] = useState([])

    const fetchChats = async () => {
        try {
            const data = (await axios.get("/api/chat")).data
            setChats(data)
            //console.log(data)
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        fetchChats()
    }, [])

    return (
        <div>
            {
                chats.map(chat => <div key={chat._id}>{chat.chatName}</div>)
            }
        </div>
    )
}

export default ChatPage

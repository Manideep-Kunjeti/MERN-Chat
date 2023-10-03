import React, { useEffect, useState } from 'react'
import { ChatState } from '../Context/ChatProvider'
import { Box, Center, FormControl, IconButton, Input, Spinner, Text, useToast } from '@chakra-ui/react'
import { ArrowBackIcon } from '@chakra-ui/icons'
import { getSender, getSenderFull } from '../config/ChatLogics'
import ProfileModal from './miscellaneous/ProfileModal'
import GroupChatModal from './miscellaneous/GroupChatModal'
import UpdateGroupChatModal from './miscellaneous/UpdateGroupChatModal'
import axios from 'axios'
import './styles.css'
import ScrollableMessages from './ScrollableMessages'
import { io } from 'socket.io-client'
import Lottie from 'react-lottie'
import animationData from '../animations/typing.json'

const ENDPOINT = 'http://localhost:5000'
var socket, selectedChatCompare

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
    const { user, selectedChat, setSelectedChat, notification, setNotification } = ChatState()
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState([])
    const [newMessage, setNewMessage] = useState()
    const [socketConnected, setSocketConnected] = useState(false)
    const [typing, setTyping] = useState(false)
    const [isTyping, setIsTyping] = useState(false)

    const defaultOptions = {
        loop: true,
        autoplay: true,
        animationData: animationData,
        rendererSettings: {
            preserveAspectRatio: 'xMidYMid slice'
        }
    }

    const toast = useToast()

    const fetchMessages = async () => {
        if (!selectedChat)
            return
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`
                }
            }

            setLoading(true)
            const { data } = await axios.get(
                `/api/message/${selectedChat._id}`,
                config
            )
            setMessages(data)
            console.log(messages);
            setLoading(false)

            socket.emit('join chat', selectedChat._id)
        } catch (error) {
            setLoading(false)
            toast({
                title: "Error Occured!",
                description: "Failed to fetch messages",
                isClosable: true,
                position: "bottom",
                duration: 5000,
                status: "error"
            })
        }
    }

    useEffect(() => {
        fetchMessages()

        selectedChatCompare = selectedChat
    }, [selectedChat])

    useEffect(() => {
        socket = io(ENDPOINT)
        socket.emit('setup', user)
        socket.on('connected', () => setSocketConnected(true))
        socket.on('typing', () => setIsTyping(true))
        socket.on('stop typing', () => setIsTyping(false))
    }, [])

    // console.log(notification)
    useEffect(() => {
        socket.on('message received', (newMessageReceived) => {
            if (!selectedChatCompare || selectedChatCompare._id !== newMessageReceived.chat._id) {
                if (!notification.includes(newMessageReceived)) {
                    setNotification([newMessageReceived, ...notification])
                    setFetchAgain(!fetchAgain)
                }
            } else {
                setMessages([...messages, newMessageReceived])
            }
        })
    })

    const sendMessage = async (event) => {
        if (event.key === 'Enter' && newMessage) {
            try {
                socket.emit('stop typing', selectedChat._id)
                const config = {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${user.token}`
                    }
                }

                setNewMessage("")
                const { data } = await axios.post(
                    '/api/message',
                    {
                        "content": newMessage,
                        "chatId": selectedChat._id
                    },
                    config)
                console.log(data);

                socket.emit("send message", data)
                setMessages([...messages, data])
            } catch (error) {
                toast({
                    title: "Error Occured",
                    description: "Failed to send message",
                    status: "error",
                    duration: 5000,
                    isClosable: true,
                    position: 'bottom'
                })
            }
        }
    }

    const typingHandler = (e) => {
        setNewMessage(e.target.value)

        if (!socketConnected)
            return
        if (!typing) {
            setTyping(true)
            socket.emit('typing', selectedChat._id)
        }
        var lastTypingTime = new Date().getTime()
        var timerLength = 5000

        setTimeout(() => {
            var timeNow = new Date().getTime()
            var diff = timeNow - lastTypingTime

            if (diff >= timerLength) {
                socket.emit('stop typing', selectedChat._id)
                setTyping(false)
            }
        }, timerLength)
    }

    return (
        <>
            {selectedChat ? (
                <>
                    <Text
                        fontSize={{ base: "28px", md: "30px" }}
                        pb={3}
                        px={2}
                        w="100%"
                        fontFamily="Jost sans-serif"
                        display="flex"
                        justifyContent={{ base: "space-between" }}
                        alignItems="center"
                    >
                        <IconButton
                            display={{ base: "flex", md: "none" }}
                            icon={<ArrowBackIcon />}
                            onClick={() => setSelectedChat("")}
                        />

                        {selectedChat.isGroupChat ? (
                            <>
                                {selectedChat.chatName}
                                <UpdateGroupChatModal fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} fetchMessages={fetchMessages} />
                            </>
                        ) : (
                            <>
                                {getSender(user, selectedChat.users)} {/* Name of the other person(other than user) */}
                                <ProfileModal user={getSenderFull(user, selectedChat.users)} />
                            </>
                        )}
                    </Text>
                    <Box
                        display="flex"
                        flexDir="column"
                        justifyContent="flex-end"
                        p={3}
                        bg="#E8E8E8"
                        w="100%"
                        h="100%"
                        borderRadius="lg"
                        overflowY="hidden"
                    >
                        {loading ? (<Spinner
                            size="xl"
                            w={20}
                            h={20}
                            alignSelf="center"
                            margin="auto" />
                        ) : (
                            <div className='messages'>
                                <ScrollableMessages messages={messages} />
                            </div>
                        )
                        }
                        <FormControl
                            marginTop={3}
                            onKeyDown={sendMessage}
                            isRequired
                        >
                            {isTyping ? (<div>
                                <Lottie
                                    options={defaultOptions}
                                    width={70}
                                    style={{ marginBottom: 20, marginLeft: 0 }}
                                />
                            </div>) : <></>}
                            <Input
                                variant="filled"
                                backgroundColor="#E0E0E0"
                                placeholder='Enter a message...'
                                onChange={typingHandler}
                                value={newMessage}
                            />
                        </FormControl>
                    </Box>
                </>
            ) : (
                <Box display="flex" alignItems="center" justifyContent="center" h="100%">
                    <Text fontSize="3xl" pb={3} fontFamily="Jost sans-serif">Click on a user to start chatting</Text>
                </Box>
            )
            }
        </>
    )
}

export default SingleChat

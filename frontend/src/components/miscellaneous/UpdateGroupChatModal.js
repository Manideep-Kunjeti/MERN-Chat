import { ViewIcon } from '@chakra-ui/icons'
import { Box, Button, FormControl, IconButton, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Spinner, useDisclosure, useToast } from '@chakra-ui/react'
import React, { useState } from 'react'
import { ChatState } from '../../Context/ChatProvider'
import UserBadgeItem from '../UserAvatar/UserBadgeItem'
import axios from 'axios'
import UserListItem from '../UserAvatar/UserListItem'
// import User from '../../../../backend/models/userModel'

const UpdateGroupChatModal = ({ fetchAgain, setFetchAgain, fetchMessages }) => {
    const { isOpen, onOpen, onClose } = useDisclosure()

    const [groupChatName, setGroupChatName] = useState()
    const [search, setSearch] = useState()
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [renameLoading, setRenameLoading] = useState(false)
    const [reqUsers, setReqUsers] = useState([])

    const toast = useToast()

    const { selectedChat, setSelectedChat, user } = ChatState()

    const handleRemove = async (user1) => {
        if (selectedChat.groupAdmin.find((u) => u._id !== user._id) && user1._id !== user._id) {
            toast({
                title: "Only Admins can remove someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            return
        }

        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }

            const { data } = await axios.put('/api/chat/groupremove', {
                chatId: selectedChat._id,
                userId: user1._id
            }, config)

            user1._id === user._id ? setSelectedChat() : setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            fetchMessages()
            setLoading(false)
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setLoading(false)
        }
    }

    const handleRename = async () => {
        if (!groupChatName) return
        try {
            setRenameLoading(true)

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }

            const { data } = await axios.put('/api/chat/rename', {
                chatId: selectedChat._id,
                chatName: groupChatName
            }, config)

            setSelectedChat(data)
            setFetchAgain(fetchAgain)
            setRenameLoading(false)
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setRenameLoading(false)
        }
        setGroupChatName("")
    }

    const handleAddUser = async (user1) => {
        if (selectedChat.users.find((u) => u._id === user1._id)) {
            toast({
                title: "User Already in Group!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            return
        }

        if (selectedChat.groupAdmin.find((u) => u._id !== user._id)) {
            toast({
                title: "Only Admins can add someone!",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            return
        }

        try {
            setLoading(true)
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }

            const { data } = await axios.put('/api/chat/groupadd', {
                chatId: selectedChat._id,
                userId: user1._id
            }, config)

            setSelectedChat(data)
            setFetchAgain(!fetchAgain)
            setLoading(false)
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: error.response.data.message,
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom"
            })
            setLoading(false)
        }
    }

    const handleSearch = async (query) => {
        setSearch(query)
        if (!query)
            return
        try {
            setLoading(true)

            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            }
            const { data } = await axios.get(`/api/user/?search=${search}`, config)

            // for (var j = 0; j < selectedChat.users.length; j++) {
            //     for (var i = 0; i < data.length; i++) {
            //         if (selectedChat.users[j]._id !== data[i]._id) {
            //             console.log(data[i]._id)
            //             console.log(selectedChat.users[j]._id)
            //             // data.remove(data[i])
            //             setReqUsers([...reqUsers, data[i]])
            //         }
            //     }
            // }
            // console.log(data)

            setLoading(false)
            setSearchResult(data)
            // setReqUsers([])s
            // const keyword = search ? {
            //     $or: [
            //         { username: { $regex: search, $options: 'i' } },
            //         { email: { $regex: search, $options: 'i' } }
            //     ]
            // } : {}
            // const allUsers = await User.find(keyword).find({ _id: { $ne: user._id } })
            // setReqUsers(allUsers.filter((u) => selectedChat.users.find((u1) => u1._id !== u._id)))
            // const reqUsers = await allUsers.find((allu) => allu._id === selectedChat.users.find((u) => u._id))

            // console.log(reqUsers)
        } catch (error) {
            toast({
                title: "Error Occured!",
                description: "Failed to load Search results",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left"
            })
            setLoading(false)
        }
    }


    return (
        <>
            <IconButton display={{ base: "flex" }} onClick={onOpen} icon={<ViewIcon />} />

            <Modal isOpen={isOpen} onClose={onClose} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader fontSize="35px" fontFamily="Jost sans-serif" display="flex" justifyContent="center">{selectedChat.chatName}</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Box w="100%" display="flex" flexWrap="wrap" pb={3} justifyContent="center">
                            {selectedChat.users.map(u => (
                                <UserBadgeItem
                                    key={user._id}
                                    user={u}
                                    handleFunction={() => handleRemove(u)}
                                />
                            ))}
                        </Box>
                        <FormControl display="flex">
                            <Input placeholder='Chat Name'
                                mb={3}
                                value={groupChatName}
                                onChange={(e) => setGroupChatName(e.target.value)}
                            />
                            <Button
                                variant="solid"
                                colorScheme='teal'
                                ml={3}
                                isLoading={renameLoading}
                                onClick={handleRename}
                            > Update </Button>
                        </FormControl>
                        <FormControl>
                            <Input placeholder='Add users to group'
                                mb={3}
                                onChange={(e) => handleSearch(e.target.value)}
                            />
                            {loading ? (
                                <Spinner display="flex" alignContent="center" size="lg" />
                            ) : (
                                searchResult?.map(user => (
                                    <UserListItem
                                        key={user._id}
                                        user={user}
                                        handleFunction={() => handleAddUser(user)}
                                    />
                                ))
                            )}
                        </FormControl>
                    </ModalBody>

                    <ModalFooter>
                        <Button colorScheme='red' onClick={() => handleRemove(user)}>
                            Leave Group
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    )
}

export default UpdateGroupChatModal

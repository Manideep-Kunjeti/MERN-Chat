import { Box, Button, Tooltip, Text, Menu, MenuButton, Avatar, MenuItem, MenuList, MenuDivider, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, Input, useToast, Spinner } from '@chakra-ui/react'
import React, { useState } from 'react'
import { SearchIcon, BellIcon, ChevronDownIcon } from '@chakra-ui/icons'
import { ChatState } from '../Context/ChatProvider'
import ProfileModal from './miscellaneous/ProfileModal'
import { useHistory } from 'react-router-dom'
import { useDisclosure } from '@chakra-ui/hooks'
import axios from 'axios'
import ChatLoading from './ChatLoading'
import UserListItem from './UserAvatar/UserListItem'

const SideDrawer = () => {
    const [search, setSearch] = useState("")
    const [searchResult, setSearchResult] = useState([])
    const [loading, setLoading] = useState(false)
    const [loadingChat, setLoadingChat] = useState()

    const { user, setSelectedChat, chats, setChats } = ChatState()
    // console.log(user)

    const history = useHistory()
    const logoutHandler = () => {
        localStorage.removeItem('userInfo')
        history.push('/');
    }

    const toast = useToast()
    const { isOpen, onOpen, onClose } = useDisclosure()

    const handleSearch = async () => {
        if (!search) {
            toast({
                title: "Please Enter something",
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'top-left'
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
            const { data } = await axios.get(`/api/user?search=${search}`, config)
            setLoading(false)
            setSearchResult(data)
            console.log(data)
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: 'Failed to load search results',
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })
        }
    }

    const accessChat = async (userId) => {
        try {
            setLoadingChat(true)
            const config = {
                headers: {
                    "Content-type": "application/json",
                    Authorization: `Bearer ${user.token}`,
                },
            }

            const { data } = await axios.post('/api/chat', { userId }, config)
            if (!chats.find((c) => c._id === data._id)) setChats([data, ...chats])
            setSelectedChat(data)
            setLoadingChat(false)
            onClose()
        } catch (error) {
            toast({
                title: 'Error Fetching the chat!',
                description: error.message,
                status: 'error',
                duration: 5000,
                isClosable: true,
                position: 'bottom-left'
            })
        }
    }
    return (
        <>
            <Box display="flex"
                justifyContent="space-between"
                alignItems="center"
                bg="white"
                p="5px 10px"
                w="100%"
                borderWidth="2px">
                <Tooltip label="Search users to chat" hasArrow placement='bottom-end'>
                    <Button variant="ghost" onClick={onOpen}>
                        <SearchIcon />
                        <Text display={{ base: "none", md: "flex" }} px="4">Search User</Text>
                    </Button>
                </Tooltip>

                <Text fontSize="2xl" fontFamily="Jost sans-serif">Chat App</Text>

                <div>
                    <Menu>
                        <MenuButton p={1}>
                            <BellIcon fontSize="2xl" m={1} />
                        </MenuButton>
                    </Menu>
                    <Menu>
                        <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
                            <Avatar size="sm" cursor="pointer" name={user.name} src={user.pic} />
                        </MenuButton>
                        <MenuList>
                            <ProfileModal user={user}>
                                <MenuItem>Profile</MenuItem>
                            </ProfileModal>
                            <MenuDivider />
                            <MenuItem onClick={logoutHandler}>Logout</MenuItem>
                        </MenuList>
                    </Menu>
                </div>
            </Box>

            <Drawer placement='left' onClose={onClose} isOpen={isOpen}>
                <DrawerOverlay />
                <DrawerContent>
                    <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
                    <DrawerBody>
                        <Box display="flex" pb={2}>
                            <Input
                                placeholder='Search by name or email'
                                mr={2}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Button onClick={handleSearch}>Go</Button>
                        </Box>
                        {loading ? (
                            <ChatLoading />
                        ) : (
                            searchResult?.map(user => (
                                <UserListItem
                                    key={user._id}
                                    user={user}
                                    handleFunction={() => accessChat(user._id)}
                                />
                            ))
                        )}
                        {loadingChat && <Spinner ml="auto" display="flex" />}
                    </DrawerBody>
                </DrawerContent>
            </Drawer>
        </>
    )
}

export default SideDrawer

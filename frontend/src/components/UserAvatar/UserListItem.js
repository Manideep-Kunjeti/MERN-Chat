import React from 'react'
import { Avatar, Box, Text } from '@chakra-ui/react'

const UserListItem = ({ user, handleFunction }) => {
    return (
        <Box
            onClick={handleFunction}
            cursor="pointer"
            bg="#E8E8E8"
            _hover={{
                background: "#6eaecf",
                color: "white"
            }}
            w="100%"
            display="flex"
            alignItems="center"
            color="black"
            px={3}
            py={2}
            mb={2}
            borderRadius="lg"
        >
            <Avatar
                mr={2}
                size="sm"
                cursor="pointer"
                name={user.username} //As per Schema
                src={user.pics} //As per Schema
            />
            <Box>
                <Text>{user.username}</Text> {/* As per Schema */}
                <Text fontSize="xs">
                    <b>Email: </b>
                    {user.email} {/* As per Schema */}
                </Text>
            </Box>
        </Box>
    )
}

export default UserListItem

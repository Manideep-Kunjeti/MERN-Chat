import React, { useEffect } from 'react'
import { Container, Box, Text, Tab, Tabs, TabPanel, TabPanels, TabList } from '@chakra-ui/react'
import './HomePage.css'
import Login from '../components/authentication/Login'
import SignUp from '../components/authentication/SignUp'
import { useHistory } from 'react-router-dom'

const HomePage = () => {
    const history = useHistory()

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))

        if (userInfo) history.push('/chats')
    }, [history])

    return (
        <Container>
            <Box className='box1'>
                <Text fontSize="3xl" fontWeight="700" color="cyan.500">Chat App</Text>
            </Box>
            <Box className='box2'>
                <Tabs variant='soft-rounded' colorScheme='cyan'>
                    <TabList mb="1em">
                        <Tab w="50%">Login</Tab>
                        <Tab w="50%">Sign Up</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <Login />
                        </TabPanel>
                        <TabPanel>
                            <SignUp />
                        </TabPanel>
                    </TabPanels>
                </Tabs>
            </Box>
        </Container>
    )
}

export default HomePage

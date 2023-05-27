import React, { useState } from 'react'
import { VStack, Button, useToast } from '@chakra-ui/react';
import CustomFormcontrol from './CustomFormcontrol';
import PassFormControl from './PassFormControl';
import axios from 'axios';
import { useHistory } from 'react-router-dom';

const Login = () => {

    const [email, setEmail] = useState('')
    const [Password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const toast = useToast()
    const history = useHistory()

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === "Email")
            setEmail(value)
        else if (name === "Password")
            setPassword(value)
    }

    const submitHandler = async () => {
        setLoading(true)
        if (!email || !Password) {
            toast({
                title: 'Please Fill all the Fields',
                status: 'warning',
                duration: 5000,
                isClosable: true
            })
            setLoading(false)
            return
        }
        try {
            const config = {
                headers: {
                    "Content-type": "application/json",
                },
            }
            const { data } = await axios.post(
                '/api/user/login', { email, Password }, config
            )
            // console.log(JSON.stringify(data))
            toast({
                title: 'Login Successful',
                status: 'success',
                duration: 5000,
                isClosable: true
            })
            localStorage.setItem('userInfo', JSON.stringify(data))
            setLoading(false)
            history.push('/chats')
        } catch (error) {
            toast({
                title: 'Error Occured',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true
            })
            setLoading(false)
        }
    }

    return (
        <VStack>
            <CustomFormcontrol id="email" label="Email" handleInputChange={handleInputChange} />
            <PassFormControl label="Password" handleInputChange={handleInputChange} />
            <Button
                onClick={submitHandler}
                colorScheme='cyan'
                color="white"
                width="100%"
                marginTop="15"
                isLoading={loading}
            >
                Login
            </Button>
        </VStack>
    )
}

export default Login

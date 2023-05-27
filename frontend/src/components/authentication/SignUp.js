import React, { useState } from 'react'
import CustomFormcontrol from './CustomFormcontrol'
import PassFormControl from './PassFormControl';
import { FormLabel, FormControl, Input, Button, useToast } from '@chakra-ui/react';
import { useHistory } from 'react-router-dom'
import axios from 'axios'

const SignUp = () => {

    const [username, setName] = useState('')
    const [email, setEmail] = useState('')
    const [Password, setPassword] = useState('')
    const [ConfirmPassword, setConfirmPassword] = useState('')
    const [pics, setPics] = useState('')
    const [loading, setLoading] = useState(false)
    const toast = useToast(); //Chakra-ui component
    const history = useHistory();


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        if (name === "Name")
            setName(value);
        else if (name === "Email")
            setEmail(value)
        else if (name === "Password")
            setPassword(value)
        else if (name === "Confirm Password")
            setConfirmPassword(value)
    }

    const postDetails = (pics) => {
        setLoading(true);
        if (pics === undefined) {
            toast({
                title: 'Please select an Image',
                // description: "We've created your account for you.",
                status: 'warning',
                duration: 5000,
                isClosable: true,
            });
            setLoading(false)
            return;
        }

        if (pics.type === 'image/jpeg' || pics.type === 'image/png') {
            const data = new FormData()
            data.append("file", pics)
            data.append('upload_preset', 'MERN-Chat')
            data.append('cloud_name', 'dvjb9lfdq')
            fetch("https://api.cloudinary.com/v1_1/dvjb9lfdq/image/upload", {
                // mode: 'no-cors',
                method: "post",
                body: data,
            }).then((res) => res.json())
                .then((data) => {
                    setPics(data.url.toString())
                    // console.log(data)
                    console.log(data.url.toString())
                    setLoading(false)
                })
                .catch((err) => {
                    console.log(err)
                    setLoading(false)
                })
        } else {
            toast({
                title: 'Please select an Image',
                status: 'warning',
                duration: 5000,
                isClosable: true,
            })
            setLoading(false)
            return;
        }
    }

    const submitHandler = async () => {
        setLoading(true)
        if (!username || !email || !Password || !ConfirmPassword) {
            toast({
                title: 'Please Fill all the Fields',
                status: 'warning',
                duration: 5000,
                isClosable: true
            })
            setLoading(false)
            return
        }
        if (Password !== ConfirmPassword) {
            toast({
                title: 'Passwords should match',
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
            };
            const { data } = await axios.post(
                '/api/user', { username, email, Password, pics }, config
            )
            console.log(data)
            toast({
                title: 'Registration Successful',
                status: 'success',
                duration: 5000,
                isClosable: true
            })

            localStorage.setItem('userInfo', JSON.stringify(data))
            setLoading(false)
            history.push('/chats')
            // navigate('/chats')
        } catch (error) {
            toast({
                title: 'Error Occured!',
                description: error.response.data.message,
                status: 'error',
                duration: 5000,
                isClosable: true
            })
            setLoading(false)
        }
    }

    return (
        <div>
            <CustomFormcontrol id="name" label="Name" handleInputChange={handleInputChange} /> {/* This is user-buikt component */}
            <CustomFormcontrol id="email" label="Email" handleInputChange={handleInputChange} />
            <PassFormControl label="Password" handleInputChange={handleInputChange} />
            <PassFormControl label="Confirm Password" handleInputChange={handleInputChange} />
            <FormControl id="pic"> {/* This is Chakra-ui component */}
                <FormLabel mb={.5}>Upload your Picture</FormLabel>
                <Input
                    type="file"
                    accept='image/'
                    onChange={(e) => postDetails(e.target.files[0])}
                    p={1.5}
                    mb={2}
                />
            </FormControl>

            <Button
                onClick={submitHandler}
                colorScheme='cyan'
                color="white"
                width="100%"
                marginTop="15"
                isLoading={loading}
            >
                Sign Up
            </Button>
        </div>
    )
}

export default SignUp

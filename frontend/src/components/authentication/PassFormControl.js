import { Button, FormControl, FormLabel, Input, InputGroup, InputRightElement } from '@chakra-ui/react'
import React, { useState } from 'react'

const PassFormControl = (props) => {
    const { label, handleInputChange } = props

    const [show, setShow] = useState(false);
    const handleClick = () => setShow(!show)

    return (
        <FormControl id="password" isRequired>
            <FormLabel mb={0.5}>{label}</FormLabel>
            <InputGroup size="md">
                <Input
                    type={show ? 'text' : 'password'}
                    name={label}
                    onChange={handleInputChange}
                    placeholder={`${label}`}
                    mb={1.5}
                />
                <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={handleClick}>
                        {show ? "Hide" : "Show"}
                    </Button>
                </InputRightElement>
            </InputGroup>
        </FormControl>
    )
}

export default PassFormControl

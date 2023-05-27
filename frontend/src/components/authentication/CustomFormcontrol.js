import { FormControl, FormLabel, Input } from '@chakra-ui/react'
import React from 'react'

const CustomFormcontrol = (props) => {
    const { id, label, handleInputChange } = props
    return (
        <FormControl id={id} isRequired >
            <FormLabel mb={0.5}>{label}</FormLabel>
            <Input
                name={label}
                onChange={handleInputChange}
                placeholder={`Enter your ${label}`}
                mb={1.5}
            />
        </FormControl>
    )
}

export default CustomFormcontrol

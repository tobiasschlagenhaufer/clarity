import { InputGroup, Button, FormControl, FormErrorMessage, FormLabel, Input, InputRightElement } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type PasswordFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	name: string;
	label: string;
	placeholder: string;
}

export const PasswordField: React.FC<PasswordFieldProps> = (props) => {
		const [field, {error}] = useField(props);
		const [show, setShow] = React.useState(false)
  		const handleClick = () => setShow(!show)
		
		return (
			<FormControl isInvalid={!!error}>
				<FormLabel htmlFor={field.name}>{props.label}</FormLabel>
				<InputGroup>
					<Input  
						{...field}
						id={field.name}
						type={show ? "text" : "password"}
						placeholder={props.placeholder}
					/>
					<InputRightElement width="4.5rem">
						<Button h="1.75rem" size="sm" onClick={handleClick}>
						{show ? "Hide" : "Show"}
						</Button>
					</InputRightElement>
				</InputGroup>
				{error ? <FormErrorMessage>{error}</FormErrorMessage> : null }
			</FormControl>
		);
}
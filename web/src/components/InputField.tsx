import { FormControl, FormErrorMessage, FormLabel, Input } from '@chakra-ui/react';
import { useField } from 'formik';
import React, { InputHTMLAttributes } from 'react'

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
	name: string;
	label: string;
	placeholder: string;
	required?: boolean;
}

export const InputField: React.FC<InputFieldProps> = (props) => {
		const [field, {error}] = useField(props);
		return (
			<FormControl isInvalid={!!error} isRequired={props.required}>
				<FormLabel mb="0" htmlFor={field.name}>{props.label}</FormLabel>
				<Input
					{...field}
					id={field.name}
					placeholder={props.placeholder}
				/>
				{error ? <FormErrorMessage>{error}</FormErrorMessage> : null }
			</FormControl>
		);
}
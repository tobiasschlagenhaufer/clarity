import React from "react";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { PasswordField } from "../components/PasswordField";
import { Box, Button, Heading, Image, Link, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Container } from "../components/Container";
import { authErrors } from "../auth-errors"
import { firebase } from '../firebase'
import NextLink from 'next/link'

interface LoginProps {}

interface FirebaseError {
    code: string;
    message: string;
}

const Login = (props: LoginProps) => {
	const router = useRouter();
    
	return (
		<Box height="100vh" overflow="hidden">
			<Container maxW={"30rem"} height="auto" p={4} m="27vh auto" borderWidth={1} borderRadius={8} boxShadow="lg" align="center" bg="rgb(255,255,255,0.8)">
				<Heading>Welcome Back</Heading>
				<Formik 
					initialValues={{ email: "", password: ""}} 
					onSubmit={ async (values, { setErrors }) => {
						
						await firebase.auth().signInWithEmailAndPassword(values.email, values.password)
						.then((response) => {
							console.log(response)
							router.push('/');
						}).catch((error) => {
							console.log(error)
							setErrors(errorToUI(error));
						});
					}}
				>
					{({ isSubmitting }) => (
						<Form>
							<Box mt={4}>
								<InputField
									name="email"
									placeholder="email"
									label="Email"	
								/>
							</Box>

							<Box mt={4}>
							<PasswordField
								name="password"
								placeholder="password"
								label="Password"
								type="password"
							/>
							</Box>

							<Button
								mt={4}
								colorScheme="teal"
								isLoading={isSubmitting}
								type="submit"
							>
								Sign in
							</Button>

						</Form>
					)}
				</Formik>
			</Container>
			<Box position="absolute" bottom="0" left="0" zIndex="-1" width="100vw" overflow="hidden" height="60%">	
				<Image src="/static/Backdrop2.png" alt="me" width="100%" bottom="0"/>
			</Box>
			<NextLink href="/">	
				<Image src="/static/Logo.png" height="7vh" position="absolute" top="2rem" left="2rem" />
			</NextLink>
		</Box>
	);
}

export default Login;

Login.defaultProps = {};

const errorToUI = (error: FirebaseError): any => {
    const formError = {} as any;
	const field = error.message.includes("email") ? "email" : "password";
    formError[field] = authErrors[error.code.replace("auth/","") as keyof typeof authErrors];
    console.log(formError)
    return formError;
}
import React from "react";
import { Formik, Form } from "formik";
import { InputField } from "../components/InputField";
import { PasswordField } from "../components/PasswordField";
import { Box, Button, Flex, Heading, Image, Link } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { Container } from "../components/Container";
import { authErrors } from "../auth-errors"
import NextLink from 'next/link'

import { firebase } from '../firebase'

interface RegisterProps {}

interface FirebaseError {
    code: string;
    message: string;
}

const Register = (props: RegisterProps) => {
    const router = useRouter();

    const createUser = (response: any, fname: string, lname: string ) => {
        const docRef = firebase.firestore().collection("users").doc(response.user?.uid);
        const newUser = {
            firstName: fname,
            lastName: lname,
            email: response.user.email,
            uid: response.user.uid
        }
        docRef.set(newUser).then(() => {
            console.log("written");
        }).catch((error) => {
            console.log(error);
        });
    }
    
	return (
        <Box height="100vh" overflow="hidden">
            <Container maxW={"30rem"} p={4} m="20vh auto" borderWidth={1} borderRadius={8} boxShadow="lg" align="center" bg="rgb(255,255,255,0.8)">
                <Heading mb={3}>Lets get started.</Heading>
                <Formik 
                    initialValues={{ fname: "", lname: "", email: "", password: ""}} 
                    onSubmit={ async (values, { setErrors }) => {

                        await firebase.auth().createUserWithEmailAndPassword(values.email, values.password)
                            .then((response) => {
                                // create a new user
                                createUser(response, values.fname, values.lname)
                                router.push('/details');
                            }).catch((error) => {
                                console.log(error)
                                setErrors(errorToUI(error));
                            });
                    }}
                >
                    {({ isSubmitting }) => (
                        <Form>
                            <Flex>
                                <Box mt={4}>
                                    <InputField
                                        name="fname"
                                        placeholder="John"
                                        label="First name"	
                                    />
                                </Box>
                                <Box mt={4} pl={1}>
                                    <InputField
                                        name="lname"
                                        placeholder="Doe"
                                        label="Surname"	
                                    />
                                </Box>
                            </Flex>

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
                                Continue
                            </Button>

                        </Form>
                    )}
                </Formik>
            </Container>
            <Box position="absolute" bottom="0" left="0" zIndex="-1" width="100vw" overflow="hidden" height="55%">	
                <Image src="/static/Backdrop2.png" alt="me" width="100%" bottom="0"/>
            </Box>
            <NextLink href="/">	
                <Image src="/static/Logo.png" height="7vh" position="absolute" top="2rem" left="2rem" />
            </NextLink>
        </Box>
	);
}

export default Register;

Register.defaultProps = {};

const errorToUI = (error: FirebaseError): any => {
    const formError = {} as any;
	const field = error.message.includes("email") ? "email" : "password";
    formError[field] = authErrors[error.code.replace("auth/","") as keyof typeof authErrors];
    console.log(formError)
    return formError;
}
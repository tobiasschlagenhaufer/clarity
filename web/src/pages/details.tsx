import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useEffect, useState } from "react";
import { Container } from "../components/Container";
import { StripeForm } from "../components/StripeForm";
import { PlaidLink } from 'react-plaid-link';
import NextLink from 'next/link'
import { Image, FormControl, Button, HStack, List, ListIcon, ListItem, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, Box } from "@chakra-ui/react";

import { firebase } from "../firebase";
import { CheckCircleIcon, QuestionIcon } from "@chakra-ui/icons";

const Details = ({}) => {
    const stripePromise = loadStripe('pk_test_51HJRmJAPO9Vmug8cmf2GS0kg5Nu3vb7FISFqWLcMHktzEGvKYV8fKVgg4xZTRFfEmfcWufSZNG3ndvCZxc8H8n7B00oROG16Cj');
    const [token, setToken] = useState(null);
    const [stripeCompletion, updateStripeCompletion] = useState(false);
    const [plaidCompletion, updatePlaidCompletion] = useState(false);

    useEffect( () => {
        // do stuff here... async () => {
        let linkToken = "";
        const getPlaidToken = firebase.functions().httpsCallable('plaidOnboarding');
        // console.log({ paymentMethodId: paymentMethod?.id, cardName: values.name })
        // await createStripeCustomer({ paymentMethodId: paymentMethod?.id, cardName: values.name })
        getPlaidToken({ type: "linkToken" })
            .then((result) => {
                // Read result of the Cloud Function.
                
                console.log(result);
                linkToken = result.data.token;
                setToken(result.data.token);
            })
            .catch((error) => {
                // Getting the Error details.
                console.log(error);
            });
    }, []);

    const onSuccess = (token: any, metadata: any) => {
        // success with plaid
        updatePlaidCompletion(true);
        // send token to server
        console.log(token);
        const getPlaidToken = firebase.functions().httpsCallable('plaidOnboarding');
        // console.log({ paymentMethodId: paymentMethod?.id, cardName: values.name })
        // await createStripeCustomer({ paymentMethodId: paymentMethod?.id, cardName: values.name })
        getPlaidToken({ publicToken: token, type: "publicToken" })
            .then((result) => {
                // Read result of the Cld Function.
                console.log(result);
            })
            .catch((error) => {
                // Getting the Error details.
                console.log(error);
            });
    };

    return (
        <Box overflow="hidden" height="100vh">
        <List spacing={10} maxW={"30rem"} p={4} m="12vh auto">
            <ListItem>
                <HStack justify={'center'} borderWidth={1} borderRadius={8} mb={2} p={2}>
                    {stripeCompletion? <ListIcon fontSize="3xl" as={CheckCircleIcon} color="green.500" /> : null }
                    <Text fontSize="xl">Set up a Payment Method.</Text>
                    <Popover>
                        <PopoverTrigger>
                            <QuestionIcon fontSize="xl"/>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader>What's this for?</PopoverHeader>
                            <PopoverBody>This is the card that will be charged when we round up your purchases.</PopoverBody>
                        </PopoverContent>
                    </Popover>
                </HStack>
                <Container p={3} borderWidth={1} borderRadius={8} boxShadow="lg" align="center" bg={stripeCompletion? "green.100" : "white"} style={stripeCompletion ? { filter: "opacity(0.3)" } : {}}>
                    <Elements stripe={stripePromise}>
                        <StripeForm updateCompletion={updateStripeCompletion} />
                    </Elements>
                </Container>
            </ListItem>
            <ListItem>
                <HStack bg="white" justify={'center'} borderWidth={1} borderRadius={8} mb={2} p={2}>
                    {plaidCompletion? <ListIcon fontSize="3xl" as={CheckCircleIcon} color="green.500" /> : null }
                    <Text fontSize="xl">Set up a Payment Method.</Text>
                    <Popover>
                        <PopoverTrigger>
                            <QuestionIcon fontSize="xl"/>
                        </PopoverTrigger>
                        <PopoverContent>
                            <PopoverArrow />
                            <PopoverCloseButton />
                            <PopoverHeader>What's this for?</PopoverHeader>
                            <PopoverBody>This will be the bank account for which purchases are tracked.</PopoverBody>
                        </PopoverContent>
                    </Popover>
                </HStack>
                { console.log(plaidCompletion)}
                <Container p={3} borderWidth={1} borderRadius={8} boxShadow="lg" align="center" bg={plaidCompletion? "green.100" : "white"} style={!stripeCompletion || plaidCompletion ? { filter: "opacity(0.3)" } : {}}>
                    <FormControl isDisabled={!plaidCompletion} > 
                        {token && stripeCompletion? 
                            <PlaidLink
                                token={token!}
                                onSuccess={onSuccess}
                                onExit={() => {updatePlaidCompletion(false)}}
                                style={{backgroundColor: "#edf2f7", color: "black", borderRadius: "8px", padding: "0.5rem"}}
                            >
                                Connect to bank account
                            </PlaidLink>
                        : 
                            <Button isDisabled={true}>
                                Connect to bank account
                            </Button>
                        }
                    </FormControl>
                </Container>
            </ListItem>
            <ListItem>
                <Container align="center">
                    <NextLink href="/">
                        <Button isDisabled={!plaidCompletion || !stripeCompletion}>
                            Finish
                        </Button>
                    </NextLink>
                </Container>
            </ListItem>
        </List>
            <Box position="fixed" bottom="0" left="0" zIndex="-1" width="100vw" overflow="hidden" height="60%">	
				<Image src="/static/Backdrop2.png" alt="me" width="100%" bottom="0" overflow="hidden"/>
            </Box>
        </Box>
    );
}

export default Details;
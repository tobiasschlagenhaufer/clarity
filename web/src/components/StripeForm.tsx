import {useStripe, useElements, CardElement} from '@stripe/react-stripe-js';
import { Button, Divider} from '@chakra-ui/react'
import {Formik, Form } from 'formik'
import { firebase, auth, usersRef } from '../firebase';
import { InputField } from './InputField';
import { useAuthState } from 'react-firebase-hooks/auth';
import React, { useState } from 'react';

interface StripeFormProps {
    updateCompletion: Function;
}

export const StripeForm = (props: StripeFormProps) => {
    const stripe = useStripe();
    const elements = useElements();
    const [authUser, loading] = useAuthState(auth);
    const [user, setUser] = useState({ firstName: "", lastName: "" });

    if (!loading) {   
        usersRef.doc(authUser.uid).get().then((data) => {
            const userObj = data.data();
            setUser({"firstName": userObj?.firstName, "lastName": userObj?.lastName})
        });
    }

    return (
        <Formik 
            initialValues={{ name: user.firstName + " " + user.lastName }} 
            enableReinitialize
            onSubmit={ async (values, { setErrors }) => {
                if (!stripe || !elements) {
                    // Stripe.js has not loaded yet. Make sure to disable
                    // form submission until Stripe.js has loaded.
                    return;
                }

                if (values.name.length < 1) {
                    setErrors({'name': 'Name is empty.'})
                }
              
                // Get a reference to a mounted CardElement. Elements knows how
                // to find your CardElement because there can only ever be one of
                // each type of element.
                const cardElement = elements.getElement(CardElement);
            
                // Use your card Element with other Stripe.js APIs
                const {error, paymentMethod} = await stripe.createPaymentMethod({
                    type: 'card',
                    card: cardElement!,
                    billing_details: {
                        name: values.name,
                    },
                });
              
                if (error) {
                    console.log('[error]', error);
                    props.updateCompletion(false);
                } else {
                    console.log('[PaymentMethod]', paymentMethod);
                    // make request to firebase
                    const createStripeCustomer = await firebase.functions().httpsCallable('createStripeCustomer');
                    // console.log({ paymentMethodId: paymentMethod?.id, cardName: values.name })
                    // await createStripeCustomer({ paymentMethodId: paymentMethod?.id, cardName: values.name })
                    await createStripeCustomer({ paymentMethodId: 'pm_card_visa', cardName: values.name })
                    .then((result) => {
                        // Read result of the Cloud Function.
                        var sanitizedMessage = result.data.text;
                        // all good! proceed to next
                        props.updateCompletion({stripe: true});
                    })
                    .catch((error) => {
                        // Getting the Error details.
                        console.log(error);
                    });
                }
            }}
        >
            {({ isSubmitting }) => (
                <Form>
                    <InputField
                        name="name"
                        placeholder="Name on card"
                        label="Name on card"
                    />
                    <Divider mt={4} mb={4}/>
                    <CardElement 
                        options={{
                            hidePostalCode: true
                        }}
                    />
                    <Divider mt={4} mb={4}/>
                    <Button
                        
                        isLoading={isSubmitting}
                        type="submit"
                    >
                        Add Payment
                    </Button>
                </Form>
            )}
        </Formik>
  );
};
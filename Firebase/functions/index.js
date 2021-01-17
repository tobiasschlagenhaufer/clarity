// firebase * firestore setup
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const firestore = admin.firestore()
const cors = require('cors')({ origin: true });
const axios = require('axios');


//var moment = require('moment');

// Stripe setup
var stripe = require('stripe')('sk_test_51I9yPsGcXPrGj0PgoyhviRmmr6navkGIKDwTgqDuqUJkUjSLwhivKyGXyrqdT9snaWOnLwwBBIe362O6Wcgh9TXp00ufVOjAcN');

// Plaid setup
var plaid = require('plaid')

//Plaid variables set for the test environment
const PLAID_CLIENT_ID = "6001cfffe1b0f7000f2d0cf4";
const PLAID_SECRET = "bae962a3bdfb019c2fba8ca5b671df";
const PLAID_ENV = 'sandbox';

//Connect to the plaid API
const client = new plaid.Client({
    clientID: PLAID_CLIENT_ID,
    secret: PLAID_SECRET,
    env: plaid.environments[PLAID_ENV],
    options: {
        version: '2019-05-29',
    },
});


// --------------
// Creating a stripe customer object oncall
exports.createStripeCustomer = functions.https.onCall((data, context) => {
    console.log(data)
    var uid = context.auth.uid;
    var userRef = firestore.collection("users").doc(uid)
    userRef.get().then((user) => {
        userData = user.data()

        // sending data to stripe to create a new customer
        stripe.customers.create(
            {
                email: userData.email,
                name: data.cardName,
                metadata: { uid: uid },
                payment_method: data.paymentMethodId
            },
            function (err, customer) {
                if (err) {
                    console.log(err)
                    return ({})
                }
                // updating firestore profile with the new stripe customer id and card name
                stripeId = customer.id
                userData['stripeId'] = stripeId
                userRef.update({
                    stripeId: stripeId,
                    cardName: data.cardName
                })
            }
        );
    })
    return ({ success: true })
})
// })

///////////
/////////// PLAID STUFF BELOW
///////////

// --------------------
// Plaid onboarding customer api
exports.plaidOnboarding = functions.https.onCall(async (data, context) => {
    var returnToken;
    var uid = context.auth.uid;
    var ACCESS_TOKEN = "";
    var ITEM_ID = "";
    if (data.type == 'linkToken') {
        // Make a request to create a link_token and pass the temporary token to your app's client.
        //can set up webhook if needed and set up METADATA
        var tokenResponse = await client.createLinkToken({
            user: {
                client_user_id: uid,
            },
            client_name: 'donateATree',
            products: ['auth', 'transactions'],
            country_codes: ['US', 'CA'],
            language: 'en',
            webhook: 'https://us-central1-donateatree-d0fd0.cloudfunctions.net/plaidwebhook'
        });
        console.log({ 'token': tokenResponse.link_token })
        return { 'token': tokenResponse.link_token }
    } else if (data.type == 'publicToken') {
        // Make a request to exchange the public_token for a permanent access_token and item_id for the new Item
        PUBLIC_TOKEN = data.publicToken;
        client.exchangePublicToken(PUBLIC_TOKEN, function (error, tokenResponse) {
            if (error != null) {
                //prettyPrintResponse(error);
                return response.json({
                    error,
                });
            }

            ACCESS_TOKEN = tokenResponse.access_token;
            ITEM_ID = tokenResponse.item_id;


            // writing the new updated data to firestore for the user
            firestore.collection("users").doc(uid).update(
                {
                    plaidToken: ACCESS_TOKEN,
                    plaidItemId: ITEM_ID
                });
            return ({ success: true })
        });
    }
    console.log(returnToken)
})

// --------------------
// Webhook for plaid transactions
exports.plaidwebhook = functions.https.onRequest((request, response) => {
    cors(request, response, async () => {
        // this is sent from plaid
        plaidObject = request.body
        console.log("IDIOT CHECK THE ACCESS TOKEN IF U NOT SEEING ANYTHIGNELSE")

        // if there are new transactions available
        if (plaidObject.webhook_code === "INITIAL_UPDATE") {
            // HERE CALL THE API AND RETRIEVE THE TRANSACTIONS that its saying to
            console.log("GOT THE WEBHOOK FOR INITAL UPDATE!", plaidObject)
            amountToUpdate = 0
            numNewTransactions = plaidObject.new_transactions;

            //needs to be the access token of the specific user
            var accessToken;
            var uid;
            await firestore.collection("users").where("plaidItemId", "==", plaidObject.item_id)
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        accessToken = doc.data().plaidToken
                        uid = doc.data().uid
                    });
                })
            console.log("accessToken", accessToken, "uid", uid)


            //needs to be a list of the accounts that the transactions will check for
            let userAccountIds = [];
            await client.getAccounts(accessToken, function (error, accountsResponse) {
                if (error != null) {
                    prettyPrintResponse(error);
                }
                else {
                    accountsResponse.accounts.forEach(userAccount => {
                        if (userAccount.subtype == "checking" || userAccount.subtype == "credit card") {
                            userAccountIds.push(userAccount.account_id);
                            console.log("available account", userAccount.subtype)
                        }
                    });
                }
            });
            console.log("USERACCOUNTID", userAccountIds)

            let startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            var dd = String(startDate.getDate()).padStart(2, '0');
            var mm = String(startDate.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = startDate.getFullYear();
            startDate = yyyy + '/' + mm + '/' + dd;
            console.log("computer made start date of init update", startDate)
            //startDate = "2021-01-01";

            let endDate = new Date();
            var dd = String(endDate.getDate()).padStart(2, '0');
            var mm = String(endDate.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = endDate.getFullYear();
            endDate = yyyy + '/' + mm + '/' + dd;
            console.log("computer made end date of init update", endDate)
            //endDate = "2021-01-17";

            var counter = 0;
            await client.getTransactions(
                //userAccountIds, taking out the accout id check
                accessToken,
                startDate,
                endDate,
                function (error, transactionsResponse) {
                    if (error != null) {
                        prettyPrintResponse(error);
                    }
                    else {
                        console.log("PRINTING THE GET TRANSACTIONS API CALL ONLY THE MOST RECENT")
                        //console.log(transactionsResponse);
                        transactionsResponse.transactions.forEach(userTransaction => {
                            console.log(JSON.stringify(userTransaction));
                            if (userTransaction.amount >= 0) {
                                console.log("Adding this ammount to the users donation for old transactions");
                                console.log((Math.ceil(userTransaction.amount) - userTransaction.amount));
                                amountToUpdate += (Math.ceil(userTransaction.amount) - userTransaction.amount);
                                counter++;
                            }

                        });
                    }
                }
            );
            // after doing the logic to retrieve the transactions for that user, and totaling add it in
            // also figure out how to know which customer the data is actually for so that we can set it below
            // In the auth of the user 
            var userRef = firestore.doc("users/" + uid + "/donations/currentMonth");
            userRef.get().then((user) => {
                userData = user.data()
                console.log("amount to update", amountToUpdate)
                userData.monthTotal += amountToUpdate
                userData.numberTransactions += counter

                // writing the new updated data to firestore
                userRef.set(userData)
            });
            //ADD SOMETHING HERE TO MAKE DONATION FROM USER ACCOUNT
        } 
        else if (plaidObject.webhook_code === "DEFAULT_UPDATE") {
            // HERE CALL THE API AND RETRIEVE THE TRANSACTIONS that its saying to
            console.log("GOT THE WEBHOOK!", plaidObject)
            amountToUpdate = 0
            numNewTransactions = plaidObject.new_transactions;
            console.log("PRINTING NUM NEW TRANSACTIONS:")
            console.log(numNewTransactions)

            //needs to be the access token of the specific user
            var accessToken;
            var uid;
            await firestore.collection("users").where("plaidItemId", "==", plaidObject.item_id)
                .get()
                .then(function (querySnapshot) {
                    querySnapshot.forEach(function (doc) {
                        accessToken = doc.data().plaidToken
                        uid = doc.data().uid
                    });
                })
            console.log("accessToken", accessToken, "uid", uid)


            //needs to be a list of the accounts that the transactions will check for
            let userAccountIds = [];
            await client.getAccounts(accessToken, function (error, accountsResponse) {
                if (error != null) {
                    prettyPrintResponse(error);
                }
                else {
                    accountsResponse.accounts.forEach(userAccount => {
                        if (userAccount.subtype == "checking" || userAccount.subtype == "credit card") {
                            userAccountIds.push(userAccount.account_id);
                            console.log("available account", userAccount.subtype)
                        }
                    });
                }
            });
            console.log("USERACCOUNTID", userAccountIds)

            let startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);
            var dd = String(startDate.getDate()).padStart(2, '0');
            var mm = String(startDate.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = startDate.getFullYear();
            startDate = yyyy + '/' + mm + '/' + dd;
            console.log("computer made start date of default Update", startDate)
            //startDate = "2021-01-01";

            let endDate = new Date();
            var dd = String(endDate.getDate()).padStart(2, '0');
            var mm = String(endDate.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = endDate.getFullYear();
            endDate = yyyy + '/' + mm + '/' + dd;
            console.log("computer made end date of default Update", endDate)
            //endDate = "2021-01-17";

            var counter = 0;
            await client.getTransactions(
                //userAccountIds, taking out the accout id check
                accessToken,
                startDate,
                endDate,
                function (error, transactionsResponse) {
                    if (error != null) {
                        prettyPrintResponse(error);
                    }
                    else {
                        console.log("PRINTING THE GET TRANSACTIONS API CALL ONLY THE MOST RECENT")
                        //console.log(transactionsResponse);
                        transactionsResponse.transactions.forEach(userTransaction => {
                            console.log(JSON.stringify(userTransaction));
                            if (numNewTransactions > 0) {
                                numNewTransactions--;
                                if (userTransaction.amount >= 0) {
                                    console.log("Adding this ammount to the users donation for new Transaction");
                                    console.log((Math.ceil(userTransaction.amount) - userTransaction.amount));
                                    amountToUpdate += (Math.ceil(userTransaction.amount) - userTransaction.amount);
                                    counter++;
                                }
                            }
                        });
                    }
                }
            );
            // after doing the logic to retrieve the transactions for that user, and totaling add it in
            // also figure out how to know which customer the data is actually for so that we can set it below
            // In the auth of the user 
            var userRef = firestore.doc("users/" + uid + "/donations/currentMonth");
            userRef.get().then((user) => {
                userData = user.data()
                console.log("amount to update", amountToUpdate)
                userData.monthTotal += amountToUpdate
                userData.numberTransactions += counter

                // writing the new updated data to firestore
                userRef.set(userData)
            });
        }

        return response.status(200).send({ received: true });
    })
});

exports.toTestPlaidWebhook = functions.firestore
    .document("justForTesting/{id}")
    .onCreate(async (snap, context) => {
        // currently this is a test function so u can run it wheneve

        var userRef = firestore.doc("justForTesting/REPLACEWITHTESTINGTOKEN");
        userRef.get().then(async (user) => {
            userData = user.data()

            // Fire a DEFAULT_UPDATE webhook for an Item
            const response = await client
                .sandboxItemFireWebhook(userData.plaidToken, 'DEFAULT_UPDATE')
                .catch((err) => {
                    // handle error
                });
        });

    });

// ---------
// adds the donation collection to a new user
exports.addAdditionalCollection = functions.firestore
    .document("users/{id}")
    .onCreate(async (snap, context) => {
        // currently this is a test function so u can run it wheneve
        uid = context.params.id
        donationRef = firestore.doc("users/" + uid + "/donations/currentMonth");
        donationRef.set({ monthTotal: 0, numberTransactions: 0 })
    });

// -----------
// start of everymonth, donate the previous months amount
// exports.donatePastMonth = functions.pubsub.schedule("0 0 1 * *")
//     .timeZone("America/New_York") // Users can choose timezone - default is America/Los_Angeles
//     .onRun(async function (context) {
//         // enter logic to total the past month of transactions and then call stripe to donate the amount
exports.testDonateEveryMonth = functions.firestore
    .document("justForTestingg/{id}")
    .onCreate((snap, context) => {
        // currently this is a test function so u can run it whenever
        console.log("It worked")

        // loop over all the customers that need to donate and then ask stripe to charge
        var allUsersRef = firestore.collection("users");
        allUsersRef.get().then((allUsers) => {
            allUsers.forEach(user => {
                var stripeId = user.data().stripeId
                var userRef = firestore.doc("users/" + uid + "/donations/currentMonth");
                var amountToDonate = await userRef.get().data().monthTotal

                // charging the customer
                // https://stripe.com/docs/api/payment_intents/create
                try {
                    stripe.paymentIntents.create({
                        amount: amountToDonate,
                        currency: "cad",
                        confirm: true,
                        customer: stripeId,
                        off_session: true,
                        payment_method_types: ["card"],
                        error_on_requires_action: true,
                        description: 'Monthly donation to plant some trees viate donateATree',
                    });
                } catch (err) {
                    // Error code will be authentication_required if authentication is needed
                    console.log('Error code is: ', err.code);
                    const paymentIntentRetrieved = stripe.paymentIntents.retrieve(err.raw.payment_intent.id);
                    console.log('PI retrieved: ', paymentIntentRetrieved.id);
                }
            });
        });
    });


///////////
/////////// APIS used for the portal below
/////////// These are being written to jsut copy over to the front end backend later

// exports.copyOver = functions.https.onCall((data, context) => {
//     var date = new Date();
//     var firstOfCurrMonth = new Date(date.getFullYear(), date.getMonth(), 1); // in epoch time

//     // to retrieve the amount for the current month to donate for a user
//     firestore.collection("users").doc(uid).collection("donations").doc(firstOfCurrMonth).get().then((user) => {
//         return 'lol'
//     })


//     return ({})
// })
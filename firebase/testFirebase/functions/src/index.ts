/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { onRequest } from "firebase-functions/v2/https";
// import * as logger from "firebase-functions/logger";
import * as admin from "firebase-admin";

admin.initializeApp()
// Start writing functions
// https://firebase.google.com/docs/functions/typescript

export const getHubliWeather = onRequest((request, response) => {
    admin.firestore().doc('cities-weather/boston-ma-us').get()
        .then(snapshot => {
            const data = snapshot.data()
            response.send(data)
        })
        .catch(error => {
            // Handle the error
            console.log(error);
            response.status(500).send(error)

        })
});

// export const getHubliWeather = onRequest((request, response) => {
//     const promise = admin.firestore().doc('cities-weather/boston-ma-us').get()
//     const p2 = promise.then(snapshot => {
//         const data = snapshot.data()
//         response.send(data)
//     })
//     p2.catch(error => {
//         // Handle the error
//         console.log(error);
//         response.status(500).send(error)

//     })
// });

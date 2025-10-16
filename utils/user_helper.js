import Msg from '../utils/message.js';
import fs from 'fs/promises';
import { insertUserNotifications } from '../models/user.model.js';
import admin from 'firebase-admin';

/*
   Load Firebase service account credentials from a JSON file.
   This file contains private keys necessary for Firebase authentication.
   Ensure the file path is correct and the JSON is properly formatted.
*/
const serviceAccount = JSON.parse(
    await fs.readFile(new URL('../utils/serviceAccountKey.json', import.meta.url))
);

/*
   Initialize Firebase Admin SDK only if it hasn't been initialized before.
   This prevents issues when the module is reloaded multiple times in a server environment.
*/
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount), // Authenticate using the service account credentials
    });
}

export const createNotificationMessage = async ({
    notificationSend,
    fullName,
    id,
    userId,
    followId,
    usersfetchFcmToken,
    notificationType,
    postId
}) => {
    let notification = {};

    /* 
       Determine the notification type based on the action.
       Developers can easily add more cases to handle additional notification types.
    */
    switch (notificationSend) {
        case 'followToAnotherUsers':
            notification = {
                title: `${fullName} ${Msg.hasFollowingYou}`,
                body: `${fullName} ${Msg.hasFollowCheckProfile}`
            };
            break;

        case 'commentsOnPost':
            notification = {
                title: `${fullName} ${Msg.commentOnPosts}`,
                body: `${fullName} ${Msg.hasCommentedCheckPost}`
            };
            break;

        case 'likedPost':
            notification = {
                title: `${fullName} ${Msg.likeOnPost}`,
                body: `${fullName} ${Msg.hasLikedCheckPost}`
            };
            break;

        default:
            // Default case handles unknown notification types gracefully
            notification = {
                title: `${fullName} ${Msg.hasFollowingYou}`,
                body: `${fullName} ${Msg.hasFollowCheckProfile}`
            };
            break;
    }

    /* 
       Return a structured notification object containing:
       - Notification title and body
       - Data payload (useful for additional processing on the client side)
       - FCM token for sending push notifications
    */
    return {
        notification,
        data: {
            sendFrom: String(id || ""),
            sendTo: String(userId || ""),
            followId: String(followId || ""),
            notificationType: String(notificationType || ""),
            postId: String(postId || "")
        },
        token: usersfetchFcmToken || ""
    };
};

export const sendNotification = async (message, postId) => {
    try {
        /*
           Store notification details in the database before sending.
           This helps in maintaining a notification history for users.
        */
        postId = postId ? postId : null;

        /*
           And save notification data in database with the help of user fetch there all
           notifications
        */
        await insertUserNotifications(message, "success", postId);

        /*
           Send the notification via Firebase Cloud Messaging (FCM).
           The response can be logged or used for debugging.
        */
        const response = await admin.messaging().send(message);
        const responseText = JSON.stringify(response);

        return { success: true, message: Msg.notificationSentSuccessfull, data: response };
    } catch (error) {
        /*
           Handle errors gracefully and provide a clear error message.
           This makes debugging and error tracking easier.
        */
        return { success: false, message: Msg.unableToSendNotification, error: error.message || error };
    }
};



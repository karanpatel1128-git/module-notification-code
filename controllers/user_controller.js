import dotenv from 'dotenv';
import Msg from '../utils/message.js';
import { NotificationTypes, variableTypes } from '../utils/constant.js';
import { handleError, handleSuccess } from '../utils/responseHandler.js';

import {
    createNotificationMessage,sendNotification, 
} from '../utils/user_helper.js';

dotenv.config();

export const sendNotificationCode = async (req, res) => {
    try {
        // Extract user details from request
        let { id, fullName } = req.user;
        let { postId, comments, parentCommentId } = req.body;
        
        // Determine if it's a post comment or a reply to a comment
        let postIds = postId || null;
        let parentCommentIds = parentCommentId || null;

        let data = {
            userId: id,
            postId: postIds,
            parentCommentId: parentCommentIds,
            comments
        };

        // Save the comment in the database
        let userLikeEntry = await addCommentsOnParticularPost(data);
        if (userLikeEntry.insertId == 0) {
            return handleError(res, 400, Msg.insertError);
        }

        // Fetch the user who created the post to send them a notification
        let fetchPostUserId = await fetchUsersByPostId(data.postId);
        if (fetchPostUserId.length > 0 && fetchPostUserId[0].userId !== id) {
            let userData = await fetchUsersById(fetchPostUserId[0].userId);
            let usersfetchFcmToken = userData[0]?.fcmToken || "";
            let userId = userData[0].id;
            let followId = null;
            
            /* 
               Define notification type:
               Since this action is adding a comment on a post, we use the COMMENTS_NOTIFICATION type.
               In future, developers can add different types such as LIKE_NOTIFICATION, APPROVAL_NOTIFICATION, etc.
            */
            let notificationType = NotificationTypes.COMMENTS_NOTIFICATION;
            let notificationSend = 'commentsOnPost';

            /* 
               Create a structured notification message so that it can be reused for other events.
               Developers can pass different notificationType values to support various notification scenarios.
            */
            let message = await createNotificationMessage({ 
                notificationSend, 
                fullName, 
                id, 
                userId, 
                followId, 
                usersfetchFcmToken, 
                notificationType, 
                postId 
            });
            
            // Send the notification to the post owner
            await sendNotification(message, postId);
        }
        
        return handleSuccess(res, 200, Msg.commentsPostedSuccessfull);
    } catch (error) {
        return handleError(res, 500, Msg.internalServerError);
    }
};

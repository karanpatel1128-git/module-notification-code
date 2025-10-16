import db from "../config/db.js";

/**=======================user model start =====================================*/

export const insertUserNotifications = async (message, status, postId, responseText) => {
    try {
        const result = await db.query(
            `INSERT INTO tbl_notification (sendFrom, sendTo, followId, title, body, notificationType, status, postId) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                message.data.sendFrom,
                message.data.sendTo,
                message.data.followId || null, // Ensure empty strings are converted to NULL
                message.notification.title,
                message.notification.body,
                message.data.notificationType,
                status,
                postId
            ]
        );
        return result;
    } catch (error) {
        console.error("Database Insert Error:", error);
        return null;
    }
};
/**========================model end========================= */

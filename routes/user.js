import express from 'express';
import controller from '../controllers/index.js';
import { authenticateUser } from '../middleware/userAuth.js';

const app = express();

app.post('/sendNotification', authenticateUser, controller.userController.sendNotificationCode);

export default app;

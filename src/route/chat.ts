import { getMessages, sendMessageToAi, sendMessageToUser } from "../controller/chat";
import { decodeToken } from "../middleware/authentication";

const express = require('express');

const routes = express.Router();

routes.route('/messages').get(decodeToken, getMessages);
routes.route('/message').post(decodeToken, sendMessageToAi);
routes.route('/message/send-to-user').post(sendMessageToUser );

export default routes;

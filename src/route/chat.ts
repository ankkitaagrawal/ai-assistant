import { getMessages, sendMessageToAi } from "../controller/chat";
import { decodeToken } from "../middleware/authentication";

const express = require('express');

const routes = express.Router();

routes.route('/messages').get(decodeToken, getMessages);
routes.route('/message').post(decodeToken, sendMessageToAi);

export default routes;

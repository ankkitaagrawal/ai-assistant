import { getMessages, sendMessageToAi, sendMessageToUser } from "../controller/chat";
import { AuthMethod, auth } from "../middleware/auth";
import { decodeToken } from "../middleware/authentication";

const express = require('express');

const routes = express.Router();

routes.route('/messages').get(auth([AuthMethod.TOKEN]), getMessages);
routes.route('/message').post(auth([AuthMethod.TOKEN]), sendMessageToAi);

routes.route('/message/:uid').post(auth([AuthMethod.TOKEN]), sendMessageToUser);
routes.route('/message/ai/:uid').post(sendMessageToUser);

export default routes;

import { getThreadMessages, sendMessageToThread } from "../controller/chat";
import { AuthMethod, auth } from "../middleware/auth";
import { decodeToken } from "../middleware/authentication";

const express = require('express');

const routes = express.Router();

routes.route('/message/:tid').get(auth([AuthMethod.TOKEN]), getThreadMessages);
routes.route('/message').post(auth([AuthMethod.TOKEN]), sendMessageToThread);

export default routes;
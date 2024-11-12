import { getMessages, sendMessageToAi } from "../controller/chat";
import { decodeToken } from "../middleware/authentication";

const express = require('express');

const routes = express.Router();

routes.route('/getmessages').get(decodeToken,getMessages);
routes.route('/sendmessage').post(decodeToken,sendMessageToAi);

export default routes;

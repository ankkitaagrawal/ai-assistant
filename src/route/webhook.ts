import { getMessages, sendMessageToAi } from "../controller/chat";
import { processWebhook } from "../controller/webhook";
import { decodeToken } from "../middleware/authentication";

const express = require('express');

const routes = express.Router();

routes.route('/:tool/:event').post(decodeToken, processWebhook);

export default routes;

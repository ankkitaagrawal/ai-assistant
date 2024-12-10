import { getThreadMessages } from "../controller/chat";
import { processWebhook } from "../controller/webhook";
import { decodeToken } from "../middleware/authentication";

const express = require('express');

const routes = express.Router();

routes.route('/:tool/:event').get(processWebhook);
// routes.route('/:tool/:actionId').get(processWebhook);

export default routes;

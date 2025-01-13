import { processWebhook } from "../controller/webhook";

const express = require('express');

const routes = express.Router();

routes.route('/:tool/:event').get(processWebhook);
// routes.route('/:tool/:actionId').get(processWebhook);

export default routes;

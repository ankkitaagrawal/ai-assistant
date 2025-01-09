import { sendFallbackMessage, sendMessage } from "../controller/tool";

const express = require('express');

const routes = express.Router();
routes.route('/fallback').post(sendFallbackMessage);
routes.route('/message').post(sendMessage);

export default routes;

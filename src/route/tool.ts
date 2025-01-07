import { sendFallbackMessage } from "../controller/tool";

const express = require('express');

const routes = express.Router();
routes.route('/fallback').post(sendFallbackMessage);

export default routes;

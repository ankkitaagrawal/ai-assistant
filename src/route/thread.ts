import { getThreads } from "../controller/thread";
import { AuthMethod, auth } from "../middleware/auth";

const express = require('express');

const routes = express.Router();

routes.route('/').get(auth([AuthMethod.TOKEN]), getThreads);
routes.route('/:assistantId').get(auth([AuthMethod.TOKEN]), getThreads);

export default routes;

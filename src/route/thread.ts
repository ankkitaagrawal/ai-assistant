import { getPluginDetails, perfromAction } from "../controller/plugin";
import { getThreads, searchThread } from "../controller/thread";
import { getFallbackThreads } from "../controller/thread";
import { AuthMethod, auth } from "../middleware/auth";

const express = require('express');

const routes = express.Router();

routes.route('/').get(auth([AuthMethod.TOKEN]), getThreads);
routes.route('/:assistantId').get(auth([AuthMethod.TOKEN]), getThreads);
routes.route('/:assistantId/fallback').get(auth([AuthMethod.TOKEN]), getFallbackThreads);
routes.route('/:assistantId/search').get(auth([AuthMethod.TOKEN]), searchThread);

export default routes;

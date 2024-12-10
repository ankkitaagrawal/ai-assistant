import { getPluginDetails, perfromAction } from "../controller/plugin";
import { getThreads } from "../controller/thread";
import { decodeToken } from "../middleware/authentication";
import { AuthMethod, auth } from "../middleware/auth";
import { getUser, updateModel } from "../controller/user";

const express = require('express');

const routes = express.Router();

routes.route('/').get(auth([AuthMethod.TOKEN]), getUser);
routes.route('/model').post(decodeToken, updateModel);

export default routes;

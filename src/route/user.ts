import { AuthMethod, auth } from "../middleware/auth";
import { getUser, updateAIService } from "../controller/user";

const express = require('express');

const routes = express.Router();

routes.route('/').get(auth([AuthMethod.TOKEN]), getUser);

export default routes;

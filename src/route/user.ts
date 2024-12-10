import { AuthMethod, auth } from "../middleware/auth";
import { getUser, updateAIService } from "../controller/user";

const express = require('express');

const routes = express.Router();

routes.route('/').get(auth([AuthMethod.TOKEN]), getUser);
routes.route('/model').patch(auth([AuthMethod.TOKEN]), updateAIService);
routes.route('/model').post(auth([AuthMethod.TOKEN]), updateAIService); //TODO: Remove this line 

export default routes;

import { AuthMethod, auth } from "../middleware/auth";
import { getUser, updateAIService } from "../controller/user";
import { createAgent, getAgent, patchAgent } from "../controller/agent";

const express = require('express');

const router = express.Router();

router.route('/:id').get(auth([AuthMethod.TOKEN]), getAgent);
router.route('/:id').patch(auth([AuthMethod.TOKEN]), patchAgent);
router.route('/').post(auth([AuthMethod.TOKEN]), createAgent);

export default router;

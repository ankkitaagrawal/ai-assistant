import { AuthMethod, auth } from "../middleware/auth";
import { addEditor, createAgent, getAgent, getAgents, getDocContextofAgent, getHeadingDataFromDiary, patchAgent, removeEditor, updateDiary, updateLinkInAgent } from "../controller/agent";

const express = require('express');

const router = express.Router();

router.route('/').post(auth([AuthMethod.TOKEN]), createAgent);
router.route('/').get(auth([AuthMethod.TOKEN]), getAgents);
router.route('/:id').get(auth([AuthMethod.TOKEN]), getAgent);
router.route('/:id').patch(auth([AuthMethod.TOKEN]), patchAgent);
router.route('/:id/doc').patch(auth([AuthMethod.TOKEN]), updateLinkInAgent);
router.route('/:id/getcontext').post(auth([AuthMethod.NONE]), getDocContextofAgent);
router.route('/:id/editor').patch(auth([AuthMethod.TOKEN]), addEditor);
router.route('/:id/editor/:editorId').delete(auth([AuthMethod.TOKEN]), removeEditor);
router.route('/:id/diary/page/:pageId').get(auth([AuthMethod.NONE]), getHeadingDataFromDiary);
router.route('/:id/diary').post(auth([AuthMethod.NONE]), updateDiary);


export default router;

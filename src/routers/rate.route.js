import { Router } from "express";
import {updateAnswerRate} from '../controllers/rate.controller.js';


const router = Router();
router.patch('/rate/:qesid/:ansid' , updateAnswerRate);

export default router;
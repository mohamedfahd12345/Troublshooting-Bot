import { Router } from "express";
import * as qeustionsControllers from '../controllers/elasticSearch.js';


const router = Router();
router.post('/question' , qeustionsControllers.addQuestionAndAnswer);
router.delete('/question/:id',qeustionsControllers.deleteQuestion);
router.put('/question/:id' , qeustionsControllers.updateQuestionAndAnswer); 
router.get('/questions',qeustionsControllers.getAllQeustions);
router.get('/answer',qeustionsControllers.getAnswer);
router.get('/answer-by-matchingPhrase',qeustionsControllers.getAnswerByMatchingPhrase);
router.get('/answer-by-multiMatch',qeustionsControllers.getAnswerByMultiMatch);

export default router;
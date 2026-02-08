import express from 'express';
import { getTenders, getTenderById } from '../controllers/tenderController.js';

const router = express.Router();

router.get('/', getTenders);
router.get('/:id', getTenderById);

export default router;

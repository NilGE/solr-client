import express from 'express';
import SpellCheck from '../spellcheck/spellCheck';

const router = express.Router();
const checker = new SpellCheck('big.txt');

router.post('/query', (req, res) => {
  res.send(req.body);
});

router.post('/spellcheck', (req, res) => {
  res.send(checker.correct(req.body.query));
});

export default router;

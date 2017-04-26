import express from 'express';
import SpellCheck from '../spellcheck/spellCheck';
import htmlToText from 'html-to-text';
import textract from 'textract';
const router = express.Router();
const checker = new SpellCheck('big.txt');



router.post('/query', (req, res) => {
  res.send(req.body);
});

router.post('/spellcheck', (req, res) => {
  res.send(checker.correct(req.body.query));
});

router.post('/getSnippet', (req, res) => {
  textract.fromFileWithMimeAndPath('text/html', req.body.id, (err, text) => {
  // htmlToText.fromFile(req.body.id, (err, text) => {
    if (err) {
      return console.error(err);
    }
    let match = new RegExp(req.body.query, 'i').exec(text);
    if (match == null) {
      res.send('');
    } else {
      let index = match.index;
      let start = index, end = index;
      while (start > 0) {
        let prev = text[start - 1];
        if (prev == '.' || prev == '?' || prev == '!' || prev == ';') {
          break;
        }
        start--;
      }
      while (end < text.length) {
        let curr = text[end];
        if (curr == '.' || curr == '?' || curr == '?' || curr == ';') {
          break;
        }
        end++;
      }
      if (end - start >= 156) {
        let prevLen = 78;
        start = index - prevLen >= 0 ? index - prevLen: 0;
        end = start + 156 - 1;
      }
      res.send(text.slice(start, end + 1).replace(/\n\s+/g, ' '));
    }
  });
});

export default router;

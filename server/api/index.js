import express from 'express';

const router = express.Router();

// router.get('/query', (req, res) => {
//   Post.find({}).then(doc => res.send(doc)).catch(console.error);
// });

router.post('/query', (req, res) => {
  res.send(req.body);
});

export default router;

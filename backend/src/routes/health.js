const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ data: { status: 'ok' }, meta: { requestId: req.requestId } });
});

module.exports = router;

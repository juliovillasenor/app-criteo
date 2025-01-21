const express = require('express');
const controller = require('./controller/index');
const router = express.Router();

router.get('/page', (req, res) => {
  controller.getCriteoPage(req, res);
});

module.exports = router;

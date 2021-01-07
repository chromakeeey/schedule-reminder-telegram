const { Router } = require('express');
const { param } = require('express-validator');

const jwtVerify = require('../middlewares/jwtVerify');

const router = Router();

const {
  findSchedules,
} = require('../mysql/schedule.commands');

router.get('/subscriptions/:keyWord', [
  param('keyWord').isString(),
], [
  jwtVerify,
], async (req, res) => {
  const { keyWord } = req.params;
  const result = await findSchedules(keyWord);

  res.status(200).json(result);
});

module.exports = router;

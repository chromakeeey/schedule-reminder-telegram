/* eslint-disable no-underscore-dangle */
require('dotenv').config();

const { Router } = require('express');
const { param } = require('express-validator');

const i18n = require('i18n');
const jwt = require('jsonwebtoken');
const jwtVerify = require('../middlewares/jwtVerify');

const bot = require('../telegram/bot');

const {
  isValidToken,
  getToken,
  deleteToken,
} = require('../mysql/auth.commands');

const router = Router();

router.get('/verify', jwtVerify, async (req, res) => {
  const { user } = req;

  res.status(200).json(user);
});

router.get('/auth/:token', [
  param('token')
    .exists().withMessage('This parameter is required'),
], [], async (req, res) => {
  const { token } = req.params;

  const isTokenExistsAndValid = await isValidToken(token);
  if (!isTokenExistsAndValid) {
    res.status(404).json({
      message: 'Token not found or not available.',
    });

    return false;
  }

  const tokenData = await getToken(token);

  const jwtToken = jwt.sign({
    user_id: tokenData.user_id,
  }, process.env.SECRET_KEY, { expiresIn: '1w' });

  await deleteToken(token);
  bot.sendMessage(tokenData.user_id, i18n.__('auth_success'));

  res.status(200).json({
    token: jwtToken,
    user: {
      id: tokenData.user_id,
    },
  });

  return true;
});

module.exports = router;

require('dotenv').config();

const { Router } = require('express');
const { param } = require('express-validator');

const jwt = require('jsonwebtoken');

const {
  isValidToken,
  getToken,
  deleteToken,
} = require('../mysql/auth.commands');

const router = Router();

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
  const tokenExpiresIn = 86400 * 7; // a week

  const jwtToken = jwt.sign({
    user_id: tokenData.user_id,
  }, process.env.SECRET_KEY, { expiresIn: tokenExpiresIn });

  await deleteToken(token);

  res.status(200).json({
    token: jwtToken,
    user: {
      id: tokenData.user_id,
    },
  });

  return true;
});

module.exports = router;

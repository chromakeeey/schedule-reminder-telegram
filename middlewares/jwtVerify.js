/* eslint-disable dot-notation */
const jwt = require('jsonwebtoken');

const jwtVerify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token is not available or does not exist' });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Token is not available or does not exist' });
    }

    req.user = user;
    next();

    return true;
  });

  return true;
};

module.exports = jwtVerify;

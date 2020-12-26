const { connectionPool } = require('./connection');
const generateToken = require('../helpers/GenerateToken');

const isValidToken = async (token) => {
  const sql = `
    SELECT expire_date FROM
      auth_token
    WHERE
      token = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    token,
  ]);

  if (rows.length === 0) {
    return false;
  }

  const expireDate = rows[0].expire_date;
  const nowDate = new Date();

  if (nowDate > expireDate) {
    return false;
  }

  return true;
};

const getToken = async (token) => {
  const sql = `
    SELECT user_id FROM
      auth_token
    WHERE
      token = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    token,
  ]);

  return rows[0];
};

const deleteToken = async (token) => {
  const sql = `
    DELETE FROM
      auth_token
    WHERE
      token = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    token,
  ]);

  return rows.affectedRows > 0;
};

const createToken = async (userId) => {
  const unicalToken = generateToken(64);
  const expireDate = new Date(new Date().getTime() + 300000);

  const sql = `
    INSERT INTO auth_token
      (token, user_id, expire_date)
    VALUES
      (?, ?, ?)
  `;

  await connectionPool.query(sql, [
    unicalToken,
    userId,
    expireDate,
  ]);

  return unicalToken;
};

module.exports = {
  isValidToken,
  getToken,
  deleteToken,
  createToken,
};

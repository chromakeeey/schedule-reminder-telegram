const { connectionPool } = require('./connection');

const isUserExists = async (userId) => {
  const [rows] = await connectionPool.query('SELECT * FROM user WHERE chatid = ?', userId);

  return rows.length > 0;
};

const getUser = async (userId) => {
  const sql = `
    SELECT * FROM user
    WHERE
      chatid = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    userId,
  ]);

  return rows[0];
};

const addUser = async (user) => {
  const sql = `
        INSERT INTO user
        (chatid, name, username)
        VALUES
        (?, ?, ?)
    `;

  const [rows] = await connectionPool.query(sql, [
    user.chatid,
    user.name,
    user.username,
  ]);

  return rows.affectedRows > 0;
};

const getUserLocale = async (userId) => {
  const sql = `
        SELECT language
        FROM user
        WHERE chatid = ?
    `;

  const [rows] = await connectionPool.query(sql, userId);

  return rows[0].language;
};

const setUserLocale = async (userId, locale) => {
  const sql = `
        UPDATE user
        SET language = ?
        WHERE chatid = ?
    `;

  const [rows] = await connectionPool.query(sql, [
    locale,
    userId,
  ]);

  return rows.affectedRows > 0;
};

const setChatState = async (userId, newState) => {
  const sql = `
        UPDATE user
        SET chat_state = ?
        WHERE chatid = ?
    `;

  const [rows] = await connectionPool.query(sql, [
    newState,
    userId,
  ]);

  return rows.affectedRows > 0;
};

const getChatState = async (userId) => {
  const sql = `
        SELECT chat_state
        FROM user
        WHERE chatid = ?
    `;

  const [rows] = await connectionPool.query(sql, userId);

  return rows[0].chat_state;
};

const getCountSchedules = async (userId) => {
  const sql = `
    SELECT COUNT(*)
    AS 
      schedule_count
    FROM
      schedule
    WHERE
      creator_id = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    userId,
  ]);

  return rows[0].schedule_count;
};

const getCountSubscriptions = async (userId) => {
  const sql = `
    SELECT COUNT(*)
    AS 
      subscription_count
    FROM
      schedule_subscription
    WHERE
      user_id = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    userId,
  ]);

  return rows[0].subscription_count;
};

const checkIfUserAdmin = async (userId) => {
  const sql = `
    SELECT admin_level
    FROM user
    WHERE chatid = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    userId,
  ]);

  if (rows.length === 0) {
    return false;
  }

  return rows[0].admin_level > 0;
};

module.exports = {
  isUserExists,
  addUser,
  getUser,
  getUserLocale,
  setUserLocale,
  setChatState,
  getChatState,
  getCountSchedules,
  getCountSubscriptions,
  checkIfUserAdmin,
};

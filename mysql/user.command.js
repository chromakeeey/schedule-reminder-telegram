const { connectionPool } = require('./connection');

const isUserExists = async (userId) => {
    const [rows] = await connectionPool.query('SELECT * FROM user WHERE chatid = ?', userId);

    return rows.length > 0;
}

const addUser = async (user) => {
    const sql = `
        INSERT INTO user
        (chatid, name)
        VALUES
        (?, ?)
    `;

    const [rows] = await connectionPool.query(sql, [
        user.chatid, 
        user.name
    ]);

    return rows.affectedRows > 0;
}

const getUserLocale = async (userId) => {
    const sql = `
        SELECT language
        FROM user
        WHERE chatid = ?
    `;

    const [rows] = await connectionPool.query(sql, userId);

    return rows[0].language;
}

const setUserLocale = async (userId, locale) => {
    const sql = `
        UPDATE user
        SET language = ?
        WHERE chatid = ?
    `;

    const [rows] = await connectionPool.query(sql, [
        locale,
        userId
    ]);

    return rows.affectedRows > 0;
}

module.exports = {
    isUserExists,
    addUser,
    getUserLocale,
    setUserLocale
}
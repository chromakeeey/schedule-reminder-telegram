const { connectionPool } = require('./connection');

const getSchedule = async (scheduleId) => {
    return null;
}

const addSchedule = async (schedule) => {
    const sql = `
        INSERT INTO schedule
        (name, creator_id)
        VALUES
        (?, ?)
    `;

    const [rows] = await connectionPool.query(sql, [
        schedule.name,
        schedule.creator_id
    ])

    return rows.insertId;
}

const linkUserToSchedule = async (scheduleId, userId) => {
    const sql = `
        INSERT INTO schedule_subscription
        (user_id, schedule_id)
        VALUES
        (?, ?)
    `;

    const [rows] = await connectionPool.query(sql, [
        scheduleId,
        userId
    ]);

    return rows.insertId;
}

const deleteLinkUserToSchedule = async (scheduleId, userId) => {
    const sql = `
        DELETE FROM schedule_subscription
        WHERE user_id = ? AND schedule_id = ?
    `;

    const [rows] = await connectionPool.query(sql, [
        userId,
        scheduleId
    ]);

    return rows.affectedRows > 0;
}

const getUserSchedules = async (userId) => {
    const sql = `
        SELECT id, name
        FROM schedule
        WHERE creator_id = ?
    `;

    const [rows] = await connectionPool.query(sql, userId);

    return rows;
}

module.exports = {
    getSchedule,
    addSchedule,
    linkUserToSchedule,
    deleteLinkUserToSchedule,
    getUserSchedules
}
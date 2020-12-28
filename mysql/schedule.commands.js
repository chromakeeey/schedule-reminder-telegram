const { connectionPool } = require('./connection');

const checkIfScheduleExists = async (scheduleId) => {
  const sql = `
    SELECT EXISTS
     (
       SELECT 1
       FROM schedule
       WHERE id = ?
     )
  `;

  const [rows] = await connectionPool.query(sql, [
    scheduleId,
  ]);

  return Object.values(rows[0])[0] === 1;
};

const checkIfUserSubscribeToSchedule = async (userId, scheduleId) => {
  const sql = `
    SELECT EXISTS
      (
        SELECT 1
        FROM schedule_subscription
        WHERE schedule_id = ? AND user_id = ?
      )
  `;

  const [rows] = await connectionPool.query(sql, [
    scheduleId,
    userId,
  ]);

  return Object.values(rows[0])[0] === 1;
};

const subscribeToSchedule = async (userId, scheduleId) => {
  const sql = `
    INSERT INTO schedule_subscription
      (user_id, schedule_id)
    VALUES
      (?, ?)
  `;

  const [rows] = await connectionPool.query(sql, [
    userId,
    scheduleId,
  ]);

  return rows.affectedRows > 0;
};

const getSchedule = async (scheduleId) => {
  const sql = `
      SELECT * FROM schedule
      WHERE id = ?
    `;

  const [rows] = await connectionPool.query(sql, [
    scheduleId,
  ]);

  return rows[0];
};

const addSchedule = async (schedule) => {
  const sql = `
    INSERT INTO schedule
    (name, creator_id)
    VALUES
    (?, ?)
  `;

  const [rows] = await connectionPool.query(sql, [
    schedule.name,
    schedule.creator_id,
  ]);

  return rows.insertId;
};

const linkUserToSchedule = async (scheduleId, userId) => {
  const sql = `
    INSERT INTO schedule_subscription
      (user_id, schedule_id)
    VALUES
      (?, ?)
  `;

  const [rows] = await connectionPool.query(sql, [
    scheduleId,
    userId,
  ]);

  return rows.insertId;
};

const deleteLinkUserToSchedule = async (scheduleId, userId) => {
  const sql = `
        DELETE FROM schedule_subscription
        WHERE user_id = ? AND schedule_id = ?
    `;

  const [rows] = await connectionPool.query(sql, [
    userId,
    scheduleId,
  ]);

  return rows.affectedRows > 0;
};

const getUserSchedules = async (userId) => {
  const sql = `
        SELECT id, name, created_at
        FROM schedule
        WHERE creator_id = ?
    `;

  const [rows] = await connectionPool.query(sql, userId);

  return rows;
};

const getUserSubscriptions = async (userId) => {
  const sql = `
    SELECT
      schedule_subscription.id,
      schedule_subscription.schedule_id,
      schedule.name
    FROM
      schedule_subscription, 
      schedule
    WHERE
      schedule_subscription.user_id = ? 
    AND 
      schedule_subscription.schedule_id = schedule.id
  `;

  const [rows] = await connectionPool.query(sql, [
    userId,
  ]);

  return rows;
};

const checkIfUserHaveAccessToEditSchedule = async (userId, scheduleId) => {
  const sql = `
    SELECT id 
    FROM schedule
    WHERE creator_id = ? AND id = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    userId,
    scheduleId,
  ]);

  return rows.length > 0;
};

const addLessonInfo = async (lessonInfo) => {
  const sql = `
    INSERT INTO lesson_info
      (schedule_id, name)
    VALUES
      (?, ?)
  `;

  const [rows] = await connectionPool.query(sql, [
    lessonInfo.schedule_id,
    lessonInfo.name,
  ]);

  return rows.affectedRows > 0;
};

const addLesson = async (lesson) => {
  const sql = `
    INSERT INTO schedule_lessons
      (schedule_id, lesson_info_id, subgroup_id, day, serial, hour_start, minute_start, hour_end, minute_end)
    VALUES
      (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  console.log(lesson);
  const [rows] = await connectionPool.query(sql, [
    lesson.schedule_id,
    lesson.lesson_info_id,
    lesson.subgroup_id,
    lesson.day,
    lesson.serial,
    lesson.time_start[0],
    lesson.time_start[1],
    lesson.time_end[0],
    lesson.time_end[1],
  ]);

  return rows.affectedRows > 0;
};

module.exports = {
  addLesson,
  addLessonInfo,
  getSchedule,
  addSchedule,
  linkUserToSchedule,
  deleteLinkUserToSchedule,
  getUserSchedules,
  getUserSubscriptions,
  checkIfScheduleExists,
  checkIfUserSubscribeToSchedule,
  subscribeToSchedule,
  checkIfUserHaveAccessToEditSchedule,
};

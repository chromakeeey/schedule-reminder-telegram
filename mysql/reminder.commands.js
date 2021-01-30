const { connectionPool } = require('./connection');

const getChatsOnStartLesson = async (hour, minute) => {
  const sql = `
    SELECT
      schedule_subscription.user_id AS chat_id,
      schedule_lessons.hour_start,
      schedule_lessons.minute_start,
      schedule_lessons.hour_end,
      schedule_lessons.minute_end,
      schedule_lessons.serial,
      lesson_info.name,
      schedule.name AS schedule_name
    FROM
      schedule_subscription,
      schedule_lessons,
      lesson_info,
      schedule
    WHERE
      hour_start = ?
    AND
      minute_start = ?
    AND
      schedule_subscription.schedule_id = schedule_lessons.schedule_id
    AND
      lesson_info.id = schedule_lessons.lesson_info_id
    AND
      schedule.id = schedule_lessons.schedule_id
  `;

  const [rows] = await connectionPool.query(sql, [
    hour,
    minute,
  ]);

  return rows;
};

const getChatsOnEndLesson = async (hour, minute) => {
  const sql = `
    SELECT
      schedule_subscription.user_id AS chat_id,
      schedule_lessons.hour_start,
      schedule_lessons.minute_start,
      schedule_lessons.hour_end,
      schedule_lessons.minute_end,
      schedule_lessons.serial,
      lesson_info.name,
      schedule.name AS schedule_name
    FROM
      schedule_subscription,
      schedule_lessons,
      lesson_info,
      schedule
    WHERE
      hour_end = ?
    AND
      minute_end = ?
    AND
      schedule_subscription.schedule_id = schedule_lessons.schedule_id
    AND
      lesson_info.id = schedule_lessons.lesson_info_id
    AND
      schedule.id = schedule_lessons.schedule_id
  `;

  const [rows] = await connectionPool.query(sql, [
    hour,
    minute,
  ]);

  return rows;
};

module.exports = {
  getChatsOnStartLesson,
  getChatsOnEndLesson,
};

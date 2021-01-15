const { connectionPool } = require('./connection');

const changeLessonTemplateName = async (lessonTemplateId, name) => {
  const sql = `
    UPDATE lesson_info
    SET name = ?
    WHERE id = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    name,
    lessonTemplateId,
  ]);

  return rows.affectedRows > 0;
};

const deleteLessonTemplate = async (lessonTemplateId) => {
  const sql = `
    DELETE FROM lesson_info
    WHERE id = ?
  `;

  const sqlSchedule = `
    DELETE FROM schedule_lessons
    WHERE lesson_info_id = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    lessonTemplateId,
  ]);

  const [rowsSchedule] = await connectionPool.query(sqlSchedule, [
    lessonTemplateId,
  ]);

  return (rows.affectedRows > 0 && rowsSchedule.affectedRows > 0);
};

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
    userId,
    scheduleId,
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

const findSchedules = async (keyWord) => {
  const ifInt = !(Number.isNaN(Number(keyWord)));
  const orSql = ifInt ? `OR id = ${Number(keyWord)}` : ' ';

  const sql = `
    SELECT
      id,
      name
    FROM
      schedule
    WHERE
      name LIKE '${keyWord}%' 
      ${orSql}
  `;

  const [rows] = await connectionPool.query(sql);
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

const editLesson = async (lessonId, lesson) => {
  const sql = `
    UPDATE 
      schedule_lessons
    SET
      lesson_info_id = ?,
      subgroup_id = ?,
      day = ?,
      serial = ?,
      hour_start = ?,
      minute_start = ?,
      hour_end = ?,
      minute_end = ?
    WHERE
      id = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    lesson.lesson_info_id,
    lesson.subgroup_id,
    lesson.day,
    lesson.serial,
    lesson.time_start[0],
    lesson.time_start[1],
    lesson.time_end[0],
    lesson.time_end[1],
    lessonId,
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

const getScheduleLessons = async (scheduleId) => {
  const sql = `
    SELECT id, name
    FROM lesson_info
    WHERE schedule_id = ?
  `;

  const [rows] = await connectionPool.query(sql, [
    scheduleId,
  ]);

  return rows;
};

const getScheduleSubscribers = async (scheduleId) => {
  const sql = `
    SELECT
      user.chatid,
      user.name,
      user.username
    FROM
      schedule_subscription,
      user
    WHERE
      schedule_subscription.schedule_id = ?
    AND
      schedule_subscription.user_id = user.chatid 
  `;

  const [rows] = await connectionPool.query(sql, [
    scheduleId,
  ]);

  return rows;
};

const getScheduleDayToEdit = async (scheduleId, dayOfWeek) => {
  const sql = `
    SELECT 
      schedule_lessons.id, 
      schedule_lessons.subgroup_id, 
      schedule_lessons.serial, 
      schedule_lessons.hour_start, 
      schedule_lessons.minute_start, 
      schedule_lessons.hour_end, 
      schedule_lessons.minute_end, 
      lesson_info.name
    FROM
      schedule_lessons,
      lesson_info
    WHERE
      (schedule_lessons.schedule_id = ? AND schedule_lessons.day = ?)
    AND
      (lesson_info.id = schedule_lessons.lesson_info_id)
  `;

  const compareSerial = (a, b) => {
    const serialA = a.serial;
    const serialB = b.serial;

    let comparsion = 0;
    if (serialA > serialB) {
      comparsion = 1;
    } else if (serialA < serialB) {
      comparsion = -1;
    }

    return comparsion;
  };

  const [rows] = await connectionPool.query(sql, [
    scheduleId,
    dayOfWeek,
  ]);

  if (rows.length === 0) {
    return rows;
  }

  rows.sort(compareSerial);

  return rows;
};

const getScheduleDay = async (scheduleId, dayOfWeek) => {
  const sql = `
    SELECT 
      schedule_lessons.id, 
      schedule_lessons.subgroup_id, 
      schedule_lessons.serial, 
      schedule_lessons.hour_start, 
      schedule_lessons.minute_start, 
      schedule_lessons.hour_end, 
      schedule_lessons.minute_end, 
      lesson_info.name
    FROM
      schedule_lessons,
      lesson_info
    WHERE
      (schedule_lessons.schedule_id = ? AND schedule_lessons.day = ?)
    AND
      (lesson_info.id = schedule_lessons.lesson_info_id)
  `;

  const compareSerial = (a, b) => {
    const serialA = a.serial;
    const serialB = b.serial;

    let comparsion = 0;
    if (serialA > serialB) {
      comparsion = 1;
    } else if (serialA < serialB) {
      comparsion = -1;
    }

    return comparsion;
  };

  const getMaxSerial = (list) => {
    let nowMaxSerial = list[0].serial;

    list.forEach((item) => {
      if (item.serial > nowMaxSerial) {
        nowMaxSerial = item.serial;
      }
    });

    return nowMaxSerial;
  };

  const [rows] = await connectionPool.query(sql, [
    scheduleId,
    dayOfWeek,
  ]);

  if (rows.length === 0) {
    return rows;
  }

  rows.sort(compareSerial);

  const maxSerial = getMaxSerial(rows);

  const lessons = [];
  for (let i = 1; i <= maxSerial; i += 1) {
    const sortedLessons = rows.filter((row) => row.serial === i);

    if (sortedLessons.length === 0) {
      lessons.push(false);
    } else {
      lessons.push(sortedLessons);
    }
  }

  return lessons;
};

module.exports = {
  editLesson,
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
  getScheduleDay,
  getScheduleDayToEdit,
  getScheduleLessons,
  findSchedules,
  getScheduleSubscribers,
  deleteLessonTemplate,
  changeLessonTemplateName,
};

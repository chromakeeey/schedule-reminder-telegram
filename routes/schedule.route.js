const { Router } = require('express');
const { param, body } = require('express-validator');

const {
  getUserSchedules,
  getSchedule,
  checkIfUserHaveAccessToEditSchedule,
  addLesson,
  addLessonInfo,
} = require('../mysql/schedule.commands');

const {
  getUser,
  checkIfUserAdmin,
} = require('../mysql/user.command');

const jwtVerify = require('../middlewares/jwtVerify');

const router = Router();

router.get('/users/:id/schedules', [
  param('id').toInt(),
], [
  jwtVerify,
], async (req, res) => {
  const { id } = req.params;
  const ifUserAdmin = await checkIfUserAdmin(req.user.user_id);

  if (id !== req.user.user_id && !ifUserAdmin) {
    res.status(403).json({ message: 'No access.' });

    return false;
  }

  const schedules = await getUserSchedules(id);
  res.status(200).json(schedules);

  return true;
});

router.get('/schedules/:id', [
  param('id').toInt(),
], [
  jwtVerify,
], async (req, res) => {
  const { id } = req.params;

  const schedule = await getSchedule(id);

  if (schedule !== undefined) {
    const user = await getUser(schedule.creator_id);
    const ifAdmin = await checkIfUserAdmin(req.user.user_id);

    delete schedule.creator_id;
    if (!ifAdmin) {
      delete user.language;
      delete user.chat_state;
      delete user.admin_level;
      delete user.created_at;
    }

    schedule.user = user;
    res.status(200).json(schedule);
  }

  return res.status(404).end();
});

router.post('/schedules/:id/lessons-info', [
  param('id').toInt(),

  body('name')
    .exists().withMessage('This parameter is required')
    .isLength({
      min: 3,
      max: 32,
    })
    .withMessage('Value should be from 3 to 32 characters'),
], [
  jwtVerify,
], async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const lessonInfo = req.body;

  const ifHaveAccess = await checkIfUserHaveAccessToEditSchedule(user.user_id, id);
  const ifAdmin = await checkIfUserAdmin(user.user_id);

  if (!ifHaveAccess && !ifAdmin) {
    res.status(403).json({ message: 'No access.' });

    return false;
  }

  lessonInfo.schedule_id = id;

  await addLessonInfo(lessonInfo);
  res.status(200).end();

  return true;
});

router.post('/schedules/:id/lessons', [
  param('id').toInt(),

  body('lesson_info_id')
    .exists().withMessage('This parameter is required.')
    .isInt()
    .toInt()
    .withMessage('The value should be of type integer.'),

  body('subgroup_id')
    .exists().withMessage('This parameter is required.')
    .isInt()
    .toInt()
    .withMessage('The value should be of type integer.'),

  body('day')
    .exists().withMessage('This parameter is required.')
    .isInt()
    .toInt()
    .withMessage('The value should be of type integer.'),

  body('serial')
    .exists().withMessage('This parameter is required.')
    .isInt()
    .toInt()
    .withMessage('The value should be of type integer.'),

  body('time_start')
    .exists().withMessage('This parameter is required.')
    .isArray()
    .toArray()
    .withMessage('The value should be of type array.'),

  body('time_end')
    .exists().withMessage('This parameter is required.')
    .isArray()
    .toArray()
    .withMessage('The value should be of type array.'),
], [
  jwtVerify,
], async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const lesson = req.body;

  const ifHaveAccess = await checkIfUserHaveAccessToEditSchedule(user.user_id, id);
  const ifAdmin = await checkIfUserAdmin(user.user_id);

  if (!ifHaveAccess && !ifAdmin) {
    res.status(403).json({ message: 'No access.' });

    return false;
  }

  lesson.schedule_id = id;

  await addLesson(lesson);
  res.status(200).end();

  return true;
});

module.exports = router;

const { Router } = require('express');
const { param, body } = require('express-validator');

const {
  getSchedule,
  checkIfUserHaveAccessToEditSchedule,
  addLesson,
  addLessonInfo,
  getScheduleDay,
  getScheduleDayToEdit,
  getScheduleLessons,
  checkIfUserSubscribeToSchedule,
  findSchedules,
  getScheduleSubscribers,
  deleteLessonTemplate,
  changeLessonTemplateName,
  editLesson,
} = require('../mysql/schedule.commands');

const {
  getUser,
  checkIfUserAdmin,
} = require('../mysql/user.command');

const daysOfWeek = require('../helpers/DaysOfWeek');
const jwtVerify = require('../middlewares/jwtVerify');

const router = Router();

router.get('/schedules/:id/to-edit', [
  param('id').toInt(),
], [
  jwtVerify,
], async (req, res) => {
  const { id } = req.params;
  const schedule = await getSchedule(id);

  if (schedule !== undefined) {
    delete schedule.creator_id;

    schedule.lessons = await getScheduleLessons(id);

    schedule.monday = await getScheduleDayToEdit(id, daysOfWeek.MONDAY);
    schedule.tuesday = await getScheduleDayToEdit(id, daysOfWeek.TUESDAY);
    schedule.wednesday = await getScheduleDayToEdit(id, daysOfWeek.WEDNESDAY);
    schedule.thursday = await getScheduleDayToEdit(id, daysOfWeek.THURSDAY);
    schedule.friday = await getScheduleDayToEdit(id, daysOfWeek.FRIDAY);
    schedule.saturday = await getScheduleDayToEdit(id, daysOfWeek.SATURDAY);
    schedule.sunday = await getScheduleDayToEdit(id, daysOfWeek.SUNDAY);

    res.status(200).json(schedule);
  }

  return res.status(404).end();
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
    const ifCreator = req.user.user_id === schedule.creator_id;

    delete schedule.creator_id;
    if (!ifAdmin) {
      delete user.language;
      delete user.chat_state;
      delete user.admin_level;
      delete user.created_at;
    }

    schedule.user = user;
    schedule.is_subscribe = await checkIfUserSubscribeToSchedule(req.user.user_id, id);
    schedule.is_edit = ifAdmin || ifCreator;

    schedule.lessons = await getScheduleLessons(id);

    schedule.monday = await getScheduleDay(id, daysOfWeek.MONDAY);
    schedule.tuesday = await getScheduleDay(id, daysOfWeek.TUESDAY);
    schedule.wednesday = await getScheduleDay(id, daysOfWeek.WEDNESDAY);
    schedule.thursday = await getScheduleDay(id, daysOfWeek.THURSDAY);
    schedule.friday = await getScheduleDay(id, daysOfWeek.FRIDAY);
    schedule.saturday = await getScheduleDay(id, daysOfWeek.SATURDAY);
    schedule.sunday = await getScheduleDay(id, daysOfWeek.SUNDAY);

    res.status(200).json(schedule);
  }

  return res.status(404).end();
});

router.get('/schedules/:id/subscribers', [
  param('id').toInt(),
], [
  jwtVerify,
], async (req, res) => {
  const { id } = req.params;
  const subscribers = await getScheduleSubscribers(id);

  res.status(200).json(subscribers);
});

router.put('/schedules/:id/lessons-info/:templateId/name', [
  param('id').toInt(),
  param('templateId').toInt(),

  body('name').isLength({
    min: 2,
    max: 32,
  }),
], [
  jwtVerify,
], async (req, res) => {
  const { id, templateId } = req.params;
  const { user } = req;
  const { name } = req.body;

  const ifHaveAccess = await checkIfUserHaveAccessToEditSchedule(user.user_id, id);
  const ifAdmin = await checkIfUserAdmin(user.user_id);

  if (!ifHaveAccess && !ifAdmin) {
    res.status(403).json({ message: 'No access.' });

    return false;
  }

  await changeLessonTemplateName(templateId, name);
  res.status(200).end();

  return true;
});

router.delete('/schedules/:id/lessons-info/:templateId', [
  param('id').toInt(),
  param('templateId').toInt(),
], [
  jwtVerify,
], async (req, res) => {
  const { id, templateId } = req.params;
  const { user } = req;

  const ifHaveAccess = await checkIfUserHaveAccessToEditSchedule(user.user_id, id);
  const ifAdmin = await checkIfUserAdmin(user.user_id);

  if (!ifHaveAccess && !ifAdmin) {
    res.status(403).json({ message: 'No access.' });

    return false;
  }

  await deleteLessonTemplate(templateId);
  res.status(200).end();

  return true;
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

router.put('/schedules/:id/lessons/:lessonId', [
  param('id').toInt(),
  param('lessonId').toInt(),

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
  const { id, lessonId } = req.params;
  const { user } = req;
  const lesson = req.body;

  const ifHaveAccess = await checkIfUserHaveAccessToEditSchedule(user.user_id, id);
  const ifAdmin = await checkIfUserAdmin(user.user_id);

  if (!ifHaveAccess && !ifAdmin) {
    res.status(403).json({ message: 'No access.' });

    return false;
  }

  await editLesson(lessonId, lesson);
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

router.get('/schedules/search/:keyWord', [
  param('keyWord').isString(),
], [
  jwtVerify,
], async (req, res) => {
  const { keyWord } = req.params;
  const result = await findSchedules(keyWord);

  res.status(200).json(result);
});

module.exports = router;

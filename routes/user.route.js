const { Router } = require('express');
const { param, body } = require('express-validator');

const jwtVerify = require('../middlewares/jwtVerify');

const router = Router();

const {
  checkIfUserAdmin,
} = require('../mysql/user.command');

const {
  linkUserToSchedule,
  deleteLinkUserToSchedule,
  getUserSchedules,
} = require('../mysql/schedule.commands');

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

router.delete('/users/:id/subscriptions/:scheduleId', [
  param('id').toInt(),
  param('scheduleId').toInt(),
], [
  jwtVerify,
], async (req, res) => {
  const { id, scheduleId } = req.params;
  const { user } = req;

  const ifAdmin = await checkIfUserAdmin(user.user_id);

  if (!ifAdmin && !(user.user_id === id)) {
    res.status(403).json({ message: 'No access.' });

    return false;
  }

  await deleteLinkUserToSchedule(scheduleId, id);
  res.status(200).end();

  return true;
});

router.post('/users/:id/subscriptions', [
  param('id').toInt(),

  body('schedule_id').isInt().withMessage('Value should be integer!'),
], [
  jwtVerify,
], async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  const { schedule_id: scheduleId } = req.body;

  const ifAdmin = await checkIfUserAdmin(user.user_id);

  if (!ifAdmin && !(user.user_id === id)) {
    res.status(403).json({ message: 'No access.' });

    return false;
  }

  await linkUserToSchedule(scheduleId, id);
  res.status(200).end();

  return true;
});

module.exports = router;

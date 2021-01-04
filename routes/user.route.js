const { Router } = require('express');
const { param } = require('express-validator');

const jwtVerify = require('../middlewares/jwtVerify');

const router = Router();

const {
  checkIfUserAdmin,
} = require('../mysql/user.command');

const {
  linkUserToSchedule,
  deleteLinkUserToSchedule,
} = require('../mysql/schedule.commands');

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

router.put('/users/:id/subscriptions/:scheduleId', [
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

  await linkUserToSchedule(scheduleId, id);
  res.status(200).end();

  return true;
});

module.exports = router;

const { Router } = require('express');
const { param } = require('express-validator');

const {
  getUserSchedules,
  getSchedule,
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

module.exports = router;

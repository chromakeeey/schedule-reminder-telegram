/* eslint-disable no-underscore-dangle */
const i18n = require('i18n');
const bot = require('./bot');
const numToTwoDigits = require('../helpers/NumberToTimeString');

const {
  getChatsOnStartLesson,
  getChatsOnEndLesson,
} = require('../mysql/reminder.commands');

const {
  getUserLocale,
} = require('../mysql/user.command');

const TYPE_REMIND = {
  START: 0,
  END: 1,
};

const sendRemind = async (remind, typeOfRemind) => {
  const chatId = remind.chat_id;

  const locale = await getUserLocale(chatId);
  i18n.setLocale(locale);

  bot.sendMessage(chatId, `${i18n.__('notification_message', remind.schedule_name)}\n\n${
    typeOfRemind === TYPE_REMIND.START
      ? i18n.__('start_lesson', remind.name, `${numToTwoDigits(remind.hour_start)}:${numToTwoDigits(remind.minute_start)}`, `${numToTwoDigits(remind.hour_end)}:${numToTwoDigits(remind.minute_end)}`)
      : i18n.__('end_lesson', remind.name, `${numToTwoDigits(remind.hour_end)}:${numToTwoDigits(remind.minute_end)}`)
  }`);
};

const checkLessonTime = async () => {
  const now = new Date();

  const hour = now.getHours();
  const minute = now.getMinutes();

  const usersStart = await getChatsOnStartLesson(hour, minute);
  const usersEnd = await getChatsOnEndLesson(hour, minute);

  await Promise.all(usersStart.map(async (user) => {
    await sendRemind(user, TYPE_REMIND.START);
  }));

  await Promise.all(usersEnd.map(async (user) => {
    await sendRemind(user, TYPE_REMIND.END);
  }));
};

module.exports = {
  checkLessonTime,
  sendRemind,
};

/* eslint-disable no-underscore-dangle */
const i18n = require('i18n');
const {
  getSchedule,
} = require('../mysql/schedule.commands');

const {
  getUserLocale,
} = require('../mysql/user.command');

const showScheduleByOwner = async (bot, chatId, scheduleId) => {
  const schedule = await getSchedule(scheduleId);
  const locale = await getUserLocale(chatId);
  i18n.setLocale(locale);

  if (schedule === undefined) {
    bot.sendMessage(chatId, i18n.__('schedule_wrong_id'));

    return false;
  }

  const buttons = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: i18n.__('edit_on_browser'), callback_data: `edit_schedule_on_browser:${scheduleId}` }],
        [{ text: i18n.__('delete'), callback_data: `delete_schedule:${scheduleId}` }],
      ],
    }),
  };

  bot.sendMessage(chatId, i18n.__('schedule_owner_menu %s %d', schedule.name, schedule.id), buttons);

  return true;
};

module.exports = {
  showScheduleByOwner,
};

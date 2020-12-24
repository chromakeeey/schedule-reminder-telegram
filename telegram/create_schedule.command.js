const {
  addSchedule,
} = require('../mysql/schedule.commands');

const createScheduleCmd = async (bot, message, match) => {
  const chatId = message.chat.id;
  const resp = match[1];

  const scheduleId = await addSchedule({
    name: resp,
    creator_id: chatId,
  });

  const messageOptions = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: '⚙️ Редагувати в браузері', callback_data: 'edit_schedule' }],
      ],
    }),
  };

  const msg = `Ви успішно створили розклад під назвою ${resp}.\nЙого ІД: ${scheduleId}`;
  bot.sendMessage(chatId, msg, messageOptions);
};

module.exports = {
  createScheduleCmd,
};

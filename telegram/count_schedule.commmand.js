const {
  countUserSchedules,
} = require('../mysql/schedule.commands');

const countScheduleCmd = async (bot, message) => {
  const chatId = message.chat.id;
  const count = await countUserSchedules(chatId);

  bot.sendMessage(chatId, `Кількість розкладів, які Ви створили: ${count}`);
};

module.exports = {
  countScheduleCmd,
};

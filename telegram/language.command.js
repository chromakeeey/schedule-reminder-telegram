/* eslint-disable no-underscore-dangle */
const i18n = require('i18n');
const {
  setUserLocale,
} = require('../mysql/user.command');

const {
  showMainMenu,
} = require('./inlineButtons');

const languageCmd = async (bot, message) => {
  const chatId = message.chat.id;

  const messageOptions = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: '🇬🇧 English', callback_data: 'language:en' }],
        [{ text: '🇺🇦 Українська', callback_data: 'language:ua' }],
        [{ text: '🇷🇺 Русский', callback_data: 'language:ru' }],
      ],
    }),
  };

  bot.sendMessage(chatId, '↧', messageOptions);
};

const onLanguageCallback = async (bot, userId, actions) => {
  const locale = actions[1];

  await setUserLocale(userId, locale);

  i18n.setLocale(locale);
  bot.sendMessage(userId, i18n.__('new_language'));
  showMainMenu(bot, userId);
};

module.exports = {
  languageCmd,
  onLanguageCallback,
};

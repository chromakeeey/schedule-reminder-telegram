/* eslint-disable no-underscore-dangle */
const i18n = require('i18n');

const bot = require('./bot');

const {
  setUserLocale,
} = require('../mysql/user.command');

const {
  showMainMenu,
} = require('./inlineButtons');

const languageCmd = async (message) => {
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

const onLanguageCallback = async (userId, actions) => {
  const locale = actions[1];

  await setUserLocale(userId, locale);

  i18n.setLocale(locale);
  bot.sendMessage(userId, i18n.__('new_language'));
  showMainMenu(userId);
};

module.exports = {
  languageCmd,
  onLanguageCallback,
};

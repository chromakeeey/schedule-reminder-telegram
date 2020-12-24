const { 
    isUserExists,
    addUser
} = require('../mysql/user.command')

const {
    showMainMenu
} = require('./inlineButtons');

const i18n = require('i18n');

const startCmd = async (bot, message) => {
    const chatId = message.chat.id;

    const messageOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '🇬🇧 English', callback_data: 'language:en'}],
                [{text: '🇺🇦 Українська', callback_data: 'language:ua'}],
                [{text: '🇷🇺 Русский', callback_data: 'language:ru'}]
            ]
        })
    }

    const isIdExists = await isUserExists(chatId);
    if (isIdExists) {
        bot.sendMessage(chatId, i18n.__('StartFound %d', chatId), messageOptions);
        showMainMenu(bot, chatId);

        return;
    }

    await addUser({
        chatid: chatId,
        name: message.chat.first_name
    })

    bot.sendMessage(chatId, i18n.__('StartNew %d', chatId), messageOptions);
    showMainMenu(bot, chatId);
}

module.exports = {
    startCmd
}
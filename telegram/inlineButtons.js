const i18n = require('i18n');

const {
    getUserLocale
} = require('../mysql/user.command')

const showMainMenu = async (bot, chatId) => {
    const locale = await getUserLocale(chatId);
    i18n.setLocale(locale);

    const buttons = {
        reply_markup: JSON.stringify({
            keyboard: [
                [i18n.__('my_account')],
                [i18n.__('my_schedules')],
                [i18n.__('my_subs')],
                [i18n.__('change_language')]
            ]
        })
    }

    bot.sendMessage(chatId, i18n.__('choose_action'), buttons);
}

module.exports = {
    showMainMenu
}
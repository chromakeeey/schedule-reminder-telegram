const i18n = require('i18n');

const {
    getUserLocale
} = require('../mysql/user.command')

const {
    getUserSchedules
} = require('../mysql/schedule.commands')

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

/*
    account - My Account
    schedules - My Schedules
    subs - My subs
    language - Change Language
*/
const onClickMenuButton = (bot, chatId, button) => {
    switch (button) {
        case 'account': {
            onClickAccountButton(bot, chatId);
            break;
        }

        case 'schedules': {
            onClickSchedulesButton(bot, chatId);
            break;
        }

        case 'subs': {
            onClickSubsButton(bot, chatId);
            break;
        }

        case 'language': {
            onClickLanguageButton(bot, chatId);
            break;
        }

    }
}

const onClickAccountButton = async (bot, chatId) => {
    //
}

const onClickSchedulesButton = async (bot, chatId) => {
    const schedules = await getUserSchedules(chatId);

    if (schedules.length === 0) {
        bot.sendMessage(chatId, i18n.__('no_your_schedules'));

        return;
    }

    let inline_keyboard = [];

    schedules.forEach(schedule => {
        inline_keyboard.push([
            {
                text: schedule.name,
                callback_data: `schedule_view_owner:${schedule.id}`
            }
        ])
    })

    bot.sendMessage(chatId, i18n.__('choose_your_schedule'), {
        reply_markup: JSON.stringify({
            inline_keyboard: inline_keyboard
        })
    })
}

const onClickSubsButton = async (bot, chatId) => {
    //
}

const onClickLanguageButton = (bot, chatId) => {
    const messageOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: '🇬🇧 English', callback_data: 'language:en'}],
                [{text: '🇺🇦 Українська', callback_data: 'language:ua'}],
                [{text: '🇷🇺 Русский', callback_data: 'language:ru'}]
            ]
        })
    }

    bot.sendMessage(chatId, '↧', messageOptions);
}

module.exports = {
    showMainMenu,
    onClickMenuButton
}
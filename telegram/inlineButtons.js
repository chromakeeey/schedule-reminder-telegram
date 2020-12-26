/* eslint-disable no-underscore-dangle */
const i18n = require('i18n');

const {
  getUserLocale,
  setChatState,
  getUser,
  getCountSchedules,
  getCountSubscriptions,
} = require('../mysql/user.command');

const {
  getUserSchedules,
  getUserSubscriptions,
} = require('../mysql/schedule.commands');

const showMainMenu = async (bot, chatId) => {
  const locale = await getUserLocale(chatId);
  i18n.setLocale(locale);

  const buttons = {
    reply_markup: JSON.stringify({
      keyboard: [
        [i18n.__('my_account')],
        [i18n.__('my_schedules')],
        [i18n.__('my_subs')],
        [i18n.__('change_language')],
        [i18n.__('add_schedule')],
      ],
    }),
  };

  bot.sendMessage(chatId, i18n.__('choose_action'), buttons);
};

const onClickAccountButton = async (bot, chatId) => {
  const locale = await getUserLocale(chatId);
  i18n.setLocale(locale);

  const user = await getUser(chatId);
  const countSchedules = await getCountSchedules(chatId);
  const countSubscriptions = await getCountSubscriptions(chatId);

  bot.sendMessage(chatId,
    i18n.__('account_information %s %s %d %d',
      user.name,
      user.created_at.toUTCString(),
      countSchedules,
      countSubscriptions));
};

const onClickSchedulesButton = async (bot, chatId) => {
  const schedules = await getUserSchedules(chatId);
  const locale = await getUserLocale(chatId);
  i18n.setLocale(locale);

  if (schedules.length === 0) {
    bot.sendMessage(chatId, i18n.__('no_your_schedules'));

    return;
  }

  const inlineKeyboard = [];

  schedules.forEach((schedule) => {
    inlineKeyboard.push([
      {
        text: schedule.name,
        callback_data: `schedule_view_owner:${schedule.id}`,
      },
    ]);
  });

  bot.sendMessage(chatId, i18n.__('choose_your_schedule'), {
    reply_markup: JSON.stringify({
      inline_keyboard: inlineKeyboard,
    }),
  });
};

const onClickSubsButton = async (bot, chatId) => {
  const subscriptions = await getUserSubscriptions(chatId);
  const locale = await getUserLocale(chatId);
  i18n.setLocale(locale);

  const inlineKeyboard = [];
  subscriptions.forEach((subscription) => {
    inlineKeyboard.push([
      {
        text: subscription.name,
        callback_data: `sub_view:${subscription.schedule_id}`,
      },
    ]);
  });

  inlineKeyboard.push([
    {
      text: i18n.__('add_new_sub'),
      callback_data: 'subscription:add',
    },
  ]);

  bot.sendMessage(chatId, i18n.__('my_subs_message %d', subscriptions.length), {
    reply_markup: JSON.stringify({
      inline_keyboard: inlineKeyboard,
    }),
  });
};

const onClickLanguageButton = (bot, chatId) => {
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

const onClickAddSchedule = async (bot, chatId) => {
  await setChatState(chatId, 1);
  const locale = await getUserLocale(chatId);
  i18n.setLocale(locale);

  const buttons = {
    reply_markup: JSON.stringify({
      hide_keyboard: true,
    }),
  };

  bot.sendMessage(chatId, i18n.__('enter_schedule_name'), buttons);
};

/*
    account - My Account
    schedules - My Schedules
    subs - My subs
    language - Change Language
    add_schedule - Add Schedule
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

    case 'add_schedule': {
      onClickAddSchedule(bot, chatId);
      break;
    }

    default: return false;
  }

  return true;
};

module.exports = {
  showMainMenu,
  onClickMenuButton,
};

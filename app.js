/* eslint-disable no-underscore-dangle */
require('dotenv').config();
require('express-async-errors');

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const i18n = require('i18n');
const path = require('path');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
const app = express();
const { PORT } = process.env;

i18n.configure({
  locales: ['ru', 'en', 'ua'],
  directory: path.join(__dirname, '/locales'),
  defaultLocale: 'en',
});

const {
  onClickMenuButton,
  showMainMenu,
} = require('./telegram/inlineButtons');

const {
  getChatState,
  setChatState,
  getUserLocale,
} = require('./mysql/user.command');

const {
  addSchedule,
  checkIfScheduleExists,
  checkIfUserSubscribeToSchedule,
  subscribeToSchedule,
} = require('./mysql/schedule.commands');

const {
  showScheduleByOwner,

} = require('./telegram/schedule');

const {
  createToken,
} = require('./mysql/auth.commands');

const { createScheduleCmd } = require('./telegram/create_schedule.command');
const { startCmd } = require('./telegram/start.command');
const { countScheduleCmd } = require('./telegram/count_schedule.commmand');
const { languageCmd, onLanguageCallback } = require('./telegram/language.command');

app.use(express.json({ extended: true }));
app.use(cors());

app.use('/', require('./routes/auth.route'));
app.use('/', require('./routes/schedule.route'));

app.get('/', (req, res) => {
  res.end('telegram.bot.schedule.reminder.2020');
});

app.use((err, req, res, next) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    res.status(500).json({
      message: 'Something went wrong.',
    });
  }

  next(err);
});

app.listen(process.env.PORT, () => {
  console.log(`App has been started on port ${PORT}...`);
});

bot.onText(/\/create_schedule (.+)/, (message, match) => createScheduleCmd(bot, message, match));
bot.onText(/\/start/, (message) => startCmd(bot, message));
bot.onText(/\/count_schedule/, (message) => countScheduleCmd(bot, message));
bot.onText(/\/language/, (message) => languageCmd(bot, message));

bot.onText(/\/token/, async (message) => {
  const chatId = message.chat.id;
  const unicalToken = await createToken(chatId);

  const url = `http://${process.env.WEB_DOMEN}/auth/${unicalToken}`;
  bot.sendMessage(chatId, `${url}`, { parse_mode: 'Markdown' });
});

bot.on('callback_query', async (message) => {
  const answer = message.data.split(':');
  const chatId = message.message.chat.id;

  if (answer[0] === 'language') {
    onLanguageCallback(bot, chatId, answer);

    return true;
  }

  if (answer[0] === 'schedule_view_owner') {
    const scheduleId = Number(answer[1]);
    showScheduleByOwner(bot, chatId, scheduleId);

    return true;
  }

  if (answer[0] === 'subscription') {
    if (answer[1] === 'add') {
      await setChatState(chatId, 2);

      const buttons = {
        reply_markup: JSON.stringify({
          hide_keyboard: true,
        }),
      };

      bot.sendMessage(chatId, i18n.__('enter_schedule_id'), buttons);
    }
  }

  return true;
});

bot.on('polling_error', (error) => {
  console.error(error.code);

  return false;
});

bot.on('message', async (message) => {
  const chatId = message.chat.id;
  const chatState = await getChatState(chatId);
  const { text } = message;

  const locale = await getUserLocale(chatId);
  i18n.setLocale(locale);

  if (chatState !== 0 && text === '/end') {
    await setChatState(chatId, 0);

    await bot.sendMessage(chatId, i18n.__('undo_end'));
    showMainMenu(bot, chatId);

    return true;
  }

  // imput schedule new name
  if (chatState === 1) {
    if (text[0] === '/') {
      bot.sendMessage(chatId, i18n.__('/_error'));

      return false;
    }

    if (!(text.length >= 3 && text.length <= 16)) {
      bot.sendMessage(chatId, i18n.__('schedule_size_error'));
    } else {
      const scheduleId = await addSchedule({
        name: text,
        creator_id: chatId,
      });

      bot.sendMessage(chatId, i18n.__('success_create_schedule %s %d', text, scheduleId));

      await setChatState(chatId, 0);
      showMainMenu(bot, chatId);
    }

    return true;
  }

  // imput schedule id (subscription)
  if (chatState === 2) {
    const scheduleId = parseInt(text, 10);

    if (Number.isNaN(scheduleId)) {
      bot.sendMessage(chatId, i18n.__('only_int'));

      return false;
    }

    const ifScheduleExists = await checkIfScheduleExists(scheduleId);
    if (!ifScheduleExists) {
      bot.sendMessage(chatId, i18n.__('no_schedule_found'));

      return false;
    }

    const ifAlreadySubscribe = await checkIfUserSubscribeToSchedule(chatId, scheduleId);
    if (ifAlreadySubscribe) {
      bot.sendMessage(chatId, i18n.__('already_subscribe'));

      return false;
    }

    await setChatState(chatId, 0);
    await subscribeToSchedule(chatId, scheduleId);
    bot.sendMessage(chatId, i18n.__('success_subscribe'));
    showMainMenu(bot, chatId);

    return true;
  }

  const numberOfAction = Number(text.split('.')[0]);

  switch (numberOfAction) {
    case 1: {
      onClickMenuButton(bot, chatId, 'account');
      break;
    }

    case 2: {
      onClickMenuButton(bot, chatId, 'schedules');
      break;
    }

    case 3: {
      onClickMenuButton(bot, chatId, 'subs');
      break;
    }

    case 4: {
      onClickMenuButton(bot, chatId, 'language');
      break;
    }

    case 5: {
      onClickMenuButton(bot, chatId, 'add_schedule');
      break;
    }

    default: {
      return false;
    }
  }

  return true;
});

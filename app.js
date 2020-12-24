require('dotenv').config();

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const i18n = require('i18n');
const path = require('path');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {polling: true});
const app = express();
const PORT = process.env.PORT;

i18n.configure({
    locales: ['ru', 'en', 'ua'],
    directory: path.join(__dirname, '/locales'),
    defaultLocale: 'en'
})

const {
    onClickMenuButton
} = require('./telegram/inlineButtons')

const { createScheduleCmd } = require('./telegram/create_schedule.command');
const { startCmd } = require('./telegram/start.command');
const { countScheduleCmd } = require('./telegram/count_schedule.commmand');
const { languageCmd, onLanguageCallback } = require('./telegram/language.command');

app.use(express.json({extended: true}))
app.use(cors())

app.get('/', (req, res) => {
    res.end('telegram.bot.schedule.reminder.2020');
});

app.listen(process.env.PORT, () => {
    console.log(`App has been started on port ${PORT}...`);
});

bot.onText(/\/create_schedule (.+)/, (message, match) => createScheduleCmd(bot, message, match));
bot.onText(/\/start/, message => startCmd(bot, message));
bot.onText(/\/count_schedule/, message => countScheduleCmd(bot, message));
bot.onText(/\/language/, message => languageCmd(bot, message));

bot.on('callback_query', message => {
    const answer = message.data.split(':');
    
    if (answer[0] === 'language') {
        onLanguageCallback(bot, message.message.chat.id, answer);

        return true;
    }

    if (answer[0] === 'schedule_view_owner') {
        

        return true;
    }
})

bot.on('polling_error', (error) => {
    console.log(error.code);
})

bot.on('message', message => {
    const chatId = message.chat.id;
    const text = message.text;
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
    }
})

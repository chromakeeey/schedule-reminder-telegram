const {
  getChatsOnStartLesson,
  getChatsOnEndLesson,
} = require('../mysql/reminder.commands');

const checkLessonTime = async () => {
  const now = new Date();

  const hour = now.getHours();
  const minute = now.getMinutes();

  const usersStart = await getChatsOnStartLesson(hour, minute);
  const usersEnd = await getChatsOnEndLesson(hour, minute);

  usersStart.forEach((user) => {
    console.log(user);
  });

  usersEnd.forEach((user) => {
    console.log('end');
    console.log(user);
  });
};

module.exports = {
  checkLessonTime,
};

// eslint-disable-next-line func-names
const generateToken = function (length) {
  let stringToken = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i += 1) {
    stringToken += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return stringToken;
};

module.exports = generateToken;

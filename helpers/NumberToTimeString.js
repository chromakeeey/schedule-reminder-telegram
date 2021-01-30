const numToTwoDigits = (integer) => (
  integer < 10
    ? `0${integer}`
    : `${integer}`
);

module.exports = numToTwoDigits;

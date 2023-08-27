const toURLString = require('../../../utils/toURLString');

const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const MONTHS_BY_LANGUAGES = {
  'en': [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',  'september', 'october', 'november', 'december' ],
  'tr': [ 'ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos',  'eylül', 'ekim', 'kasım', 'aralık' ],
  'ru': [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль',  'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ]
};

module.exports = (data) => {
  // const { name, start_date, end_date, language = 'en' } = data;
  // I did not see the implementation of above line in your code so I didn't use it. I have learnt it in the course. Wouldn't it be faster?

  let identifier = toURLString(data.name);

  if (data.start_date || typeof data.start_date == 'string' || !isNaN(data.start_date)) {
    const startDate = new Date(data.start_date);
    const startDay = startDate.getDate();
    const month = MONTHS_BY_LANGUAGES[(data.language != null && data.language != undefined) ? data.language : DEFAULT_IDENTIFIER_LANGUAGE][startDate.getMonth()];
    const year = startDate.getFullYear();

    if (data.end_date || typeof data.end_date == 'string' || !isNaN(data.end_date)) {
      const endDate = new Date(data.end_date);
      const endDay = endDate.getDate();
      return `${identifier}-${startDay}-${endDay}-${month}-${year}`;
    } else {
      return `${identifier}-${startDay}-${month}-${year}`;
    }
  }

  return identifier;
};

const toURLString = require('../../../utils/toURLString');

const DEFAULT_IDENTIFIER_LANGUAGE = 'en';
const MONTHS_BY_LANGUAGES = {
  'en': [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',  'september', 'october', 'november', 'december' ],
  'tr': [ 'ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos',  'eylül', 'ekim', 'kasım', 'aralık' ],
  'ru': [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль',  'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ]
};

module.exports = (data, language) => {
  language = language || DEFAULT_IDENTIFIER_LANGUAGE;
  language = MONTHS_BY_LANGUAGES[language] ? language : DEFAULT_IDENTIFIER_LANGUAGE;
  let identifier = toURLString(data.name);

  if (data.start_date) {
    const startDate = new Date(data.start_date);
    if (isNaN(startDate)) return identifier;

    const startDay = startDate.getDate();
    const startMonthIndex = startDate.getMonth();
    const startMonth = MONTHS_BY_LANGUAGES[language][startMonthIndex];
    const startYear = startDate.getFullYear();

    if (data.end_date) {
      const endDate = new Date(data.end_date);
      if (isNaN(endDate)) {
        return `${identifier}-${startDay}-${startMonth}-${startYear}`;
      }

      const endDay = endDate.getDate();
      const endMonthIndex = endDate.getMonth();
      const endMonth = MONTHS_BY_LANGUAGES[language][endMonthIndex];
      const endYear = endDate.getFullYear();

      if (startYear == endYear) {
        if (startMonth == endMonth) {
          return `${identifier}-${startDay}-${endDay}-${startMonth}-${startYear}`;
        } else {
          return `${identifier}-${startDay}-${startMonth}-${endDay}-${endMonth}-${startYear}`;
        }
      } else {
        return `${identifier}-${startDay}-${startMonth}-${startYear}-${endDay}-${endMonth}-${endYear}`;
      }
    } else {
      return `${identifier}-${startDay}-${startMonth}-${startYear}`;
    }
  }

  return identifier;
};

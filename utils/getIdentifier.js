const toURLString = require('./toURLString');

const MONTHS_BY_LANGUAGES = {
    'en': [ 'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',  'september', 'october', 'november', 'december' ],
    'tr': [ 'ocak', 'şubat', 'mart', 'nisan', 'mayıs', 'haziran', 'temmuz', 'ağustos',  'eylül', 'ekim', 'kasım', 'aralık' ],
    'ru': [ 'январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль',  'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь' ]
};

module.exports = (name, date, language) => {
    const identifier = `${toURLString(name)}-${toURLString(MONTHS_BY_LANGUAGES[language][new Date(date).getMonth()])}-${new Date(date).getFullYear()}`;

    return identifier;
};
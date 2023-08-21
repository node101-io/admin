module.exports = (date, format) => {
    if (!date || !(date instanceof Date))
        return 'bad_request';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const formats = {
        'MM-DD-YYYY': () => `${month}-${day}-${year}`,
        'YYYY-MM-DD': () => `${year}-${month}-${day}`,
        'DD-MM-YYYY': () => `${day}-${month}-${year}`
    };

    const formatter = formats[format] || formats['DD-MM-YYYY'];
    return formatter();
};
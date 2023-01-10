// Gets the book document
// Updates translations docs accordingly
// Returns the updated translations object

const validator = require('validator');

module.exports = (book, data) => {
  if (!data || typeof data != 'object')
    return book.translations;

  if (!data.language || !validator.isISO31661Alpha2(data.language.toString()))
    return book.translations;

  const old = book.translations[data.language.toString().trim()] ? book.translations[data.language.toString().trim()] : book;

  book.translations[data.language.toString().trim()] = {
    
  };
}

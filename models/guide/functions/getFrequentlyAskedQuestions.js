const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;

module.exports = data => {
  if (!data || !Array.isArray(data))
    return callback([]);

  return data
    .filter(each =>
      each.question && typeof each.question == 'string' && each.question.trim().length && each.question.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH &&
      each.answer && typeof each.answer == 'string' && each.answer.trim().length && each.answer.trim().length < MAX_DATABASE_TEXT_FIELD_LENGTH
    )
    .map(each => {
      return {
        question: each.question.trim(),
        answer: each.answer.trim()
      }
    });
};
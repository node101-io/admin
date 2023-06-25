const async = require('async');

const WritingFilter = require('../../writing_filter/WritingFilter');

const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_VALUES = ['en', 'tr', 'ru'];

function generateWritingFilterData(writing, language) {
  const title = new Set();
  const subtitle = new Set();

  if (language == DEFAULT_LANGUAGE) {
    writing.title.split(' ').map(each => title.add(each));
    writing.subtitle.split(' ').map(each => subtitle.add(each));
  
    return {
      writing_id: writing._id,
      language,
      title: Array.from(title).join(' '),
      type: writing.type,
      parent_id: writing.parent_id,
      parent_title: writing.parent_title,
      writer_id: writing.writer_id,
      created_at: writing.created_at,
      subtitle: Array.from(subtitle).join(' '),
      label: writing.label,
      flag: writing.flag,
      order: writing.order
    };
  } else {
    writing.translations[language].title.split(' ').map(each => title.add(each));
    writing.translations[language].subtitle.split(' ').map(each => subtitle.add(each));
  
    return {
      writing_id: writing._id,
      language,
      title: Array.from(title).join(' '),
      type: writing.type,
      parent_id: writing.parent_id,
      parent_title: writing.translations[language].parent_title,
      writer_id: writing.writer_id,
      created_at: writing.created_at,
      subtitle: Array.from(subtitle).join(' '),
      label: writing.label,
      flag: writing.translations[language].flag,
      order: writing.order
    };
  }  
};

module.exports = (writing, callback) => {
  if (writing.type != 'blog')
    return callback(null);

  async.timesSeries(
    LANGUAGE_VALUES.length,
    (time, next) => {
      const language = LANGUAGE_VALUES[time];

      const data = generateWritingFilterData(writing, language);

      WritingFilter.findWritingFilterByWritingIdAndLanguage(writing._id, language, (err, writing_filter) => {
        if (err && err != 'document_not_found') return next(err);

        if (
          !writing.is_completed ||
          writing.is_deleted ||
          (language == DEFAULT_LANGUAGE ? writing.is_hidden : writing.translations[language].is_hidden)
        ) {
          if (err) return next(null);
    
          WritingFilter.findWritingFilterByIdAndDelete(writing_filter._id, err => {
            if (err) return next(err);

            return next(null);
          });
        } else {
          if (err) {
            WritingFilter.createWritingFilter(data, err => {
              if (err) return next(err);
      
              return next(null);
            })
          } else {
            if (!Object.keys(data).find(key => data[key] && data[key].toString() != writing_filter[key]?.toString()))
              return next(null);
    
            WritingFilter.findWritingFilterByIdAndUpdate(writing_filter._id, data, err => {
              if (err) return next(err);
    
              return next(null);
            });
          };
        };
      });
    },
    err => callback(err)
  );
};
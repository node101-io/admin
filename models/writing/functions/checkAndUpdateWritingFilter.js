const WritingFilter = require('../../writing_filter/WritingFilter');

function generateWritingFilterData(writing) {
  const title = new Set();
  const subtitle = new Set();

  writing.title.split(' ').map(each => title.add(each));
  writing.translations.tr.title.split(' ').map(each => title.add(each));
  writing.translations.ru.title.split(' ').map(each => title.add(each));

  writing.subtitle.split(' ').map(each => subtitle.add(each));
  writing.translations.tr.subtitle.split(' ').map(each => subtitle.add(each));
  writing.translations.ru.subtitle.split(' ').map(each => subtitle.add(each));

  return {
    writing_id: writing._id,
    title: Array.from(title).join(' '),
    type: writing.type,
    parent_id: writing.parent_id,
    writer_id: writing.writer_id,
    created_at: writing.created_at,
    subtitle: Array.from(subtitle).join(' '),
    label: writing.label,
    flag: writing.flag,
    order: writing.order
  };
};

module.exports = (writing, callback) => {
  const data = generateWritingFilterData(writing);

  WritingFilter.findWritingFilterByWritingId(writing._id, (err, writing_filter) => {
    if (err && err != 'document_not_found') return callback(err);

    if (
      !writing.is_completed ||
      writing.is_deleted ||
      writing.is_hidden
    ) {
      if (err) return callback(null);

      WritingFilter.findWritingFilterByIdAndDelete(writing_filter._id, err => {
        if (err) return callback(err);

        return callback(null);
      });
    } else {
      if (err) {
        WritingFilter.createWritingFilter(data, err => {
          if (err) return callback(err);
  
          return callback(null);
        })
      } else {
        if (!Object.keys(data).find(key => data[key] && data[key].toString() != writing_filter[key]?.toString()))
          return callback(null);

        WritingFilter.findWritingFilterByIdAndUpdate(writing_filter._id, data, err => {
          if (err) return callback(err);

          return callback(null);
        });
      };
    };
  });
};
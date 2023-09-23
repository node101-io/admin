module.exports = event => {
  return event &&
    event.name &&
    event.description &&
    event.event_type &&
    event.start_date ? true : false
};
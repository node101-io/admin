module.exports = event => {
  return event &&
    event.name &&
    event.start_date &&
    event.description &&
    event.event_type ? true : false
};
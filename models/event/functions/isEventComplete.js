module.exports = event => {
    return event &&
      event.name &&
      event.start_date &&
      event.description &&
      event.location ? true : false
  };
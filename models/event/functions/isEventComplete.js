module.exports = event => {
    return event &&
      event.name &&
      event.date &&
      event.description &&
      event.location ? true : false
  };
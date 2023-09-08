const validator = require('validator');

module.exports = data => {
  const accounts = {};

  if (!data || typeof data != 'object')
    return accounts;

  if (data.instagram && validator.isURL(data.instagram.toString()))
    accounts.instagram = data.instagram.toString().trim();
  if (data.medium && validator.isURL(data.medium.toString()))
    accounts.medium = data.medium.toString().trim();
  if (data.telegram && validator.isURL(data.telegram.toString()))
    accounts.telegram = data.telegram.toString().trim();
  if (data.github && validator.isURL(data.github.toString()))
    accounts.github = data.github.toString().trim();
  if (data.discord && validator.isURL(data.discord.toString()))
    accounts.discord = data.discord.toString().trim();
  if (data.twitter && validator.isURL(data.twitter.toString()))
    accounts.twitter = data.twitter.toString().trim();
  if (data.linkedin && validator.isURL(data.linkedin.toString()))
    accounts.linkedin = data.linkedin.toString().trim();
  if (data.youtube && validator.isURL(data.youtube.toString()))
    accounts.youtube = data.youtube.toString().trim();
  if (data.spotify && validator.isURL(data.spotify.toString()))
    accounts.spotify = data.spotify.toString().trim();
  if (data.web && validator.isURL(data.web.toString()))
    accounts.web = data.web.toString().trim();
  if (data.gitbook && validator.isURL(data.gitbook.toString()))
    accounts.gitbook = data.gitbook.toString().trim();
  if (data.facebook && validator.isURL(data.facebook.toString()))
    accounts.facebook = data.facebook.toString().trim();
  
  return accounts;
};

const fetch = require('node-fetch');

module.exports = (price_api_name, callback) => {
  if (!price_api_name || typeof price_api_name != 'string' || !price_api_name.trim().length)
    return callback('bad_request');

  fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${price_api_name}&vs_currencies=usd`, {
    method: 'GET'
  })
    .then(data => data.json())
    .then(res => {
      if (!res || !res[price_api_name]?.usd)
        return callback('bad_request');

      return callback(null, res[price_api_name].usd);
    })
    .catch(_ => callback('fetch_error'));
}
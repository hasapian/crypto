const CoinMarketCap = require('coinmarketcap-api')
 
const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)
 
//client.getQuotes({symbol: 'BTC,ETH'}).then(console.log).catch(console.error)
client.getQuotes({symbol: ['BTC', 'ETH']}).then(console.log).catch(console.error)
//client.getTickers({limit: 3}).then(console.log).catch(console.error)
//client.getGlobal().then(console.log).catch(console.error)

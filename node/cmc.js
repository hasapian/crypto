const CoinMarketCap = require('coinmarketcap-api')
 
const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)

client.getQuotes({symbol: 'BTC,ETH'}).then((results) => {
	console.log("BTC: "+ results.data.BTC.quote.USD.price);
	console.log("ETH: "+ results.data.ETH.quote.USD.price);
}).catch(console.error)


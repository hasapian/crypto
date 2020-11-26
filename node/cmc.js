const CoinMarketCap = require('coinmarketcap-api')
 
const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)

client.getQuotes({symbol: 'BTC,ETH'}).then((results) => {
	console.log("1: " + results);
	console.log("2: " + results.data);
	console.log("3: " + results.data.BTC);
	var lala = 'BTC';
	console.log("4: " + results.data[lala].quote.USD.price);
	console.log("BTC: "+ results.data.BTC.quote.USD.price);
	console.log("ETH: "+ results.data.ETH.quote.USD.price);
}).catch(console.error)


const CoinGecko = require('coingecko-api');
 
const CoinGeckoClient = new CoinGecko();

CoinGeckoClient.coins.list().then((results) => {
    console.log(results);
}).catch(console.error)

// CoinGeckoClient.simple.price({
// 		ids: ['bitcoin','ethereum'],
// 		vs_currencies: ['eur', 'usd'],
// 	}).then((results) => {
// 		console.log(results.data.bitcoin.usd);
// 	}).catch(console.error)
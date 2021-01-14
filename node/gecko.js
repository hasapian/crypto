const CoinGecko = require('coingecko-api');
 
const CoinGeckoClient = new CoinGecko();

CoinGeckoClient.simple.price({
		ids: ['bitcoin','ethereum'],
		vs_currencies: ['eur', 'usd'],
	}).then((results) => {
		console.log(results.data.bitcoin.usd);
	}).catch(console.error)



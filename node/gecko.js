const CoinGecko = require('coingecko-api');
 
const CoinGeckoClient = new CoinGecko();

CoinGeckoClient.coins.list().then((results) => {
    for(i=0;i<results.data.length;i++) {
	    if(results.data[i].symbol == 'blz'){
		    console.log(i);
		    console.log(results.data[i].id);
		    var spyros = results.data[i].id;
		    CoinGeckoClient.simple.price({
			    ids:[spyros],
			    vs_currencies:['usd']
		    }).then((result) => {
			    console.log(result.data[spyros].usd);
		    }).catch(console.error)
	    }
    }
}).catch(console.error)


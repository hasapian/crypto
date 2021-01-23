var mysql = require("mysql");
const CoinGecko = require('coingecko-api');
	 
const CoinGeckoClient = new CoinGecko();


var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "Olt34eedmp",
  database: "cryptoDB"
});

con.connect(function(err) {
  if (err) throw err;
});

con.query("select * from coins", function(err,result) {
	if(err) throw err;
	var data = result;
	var found,i;
    var coinIds = [];
    var unfound = [];

    CoinGeckoClient.coins.markets({per_page:[250],page:[1]}).then((markets) => {
        for(j=0;j<data.length;j++) {
            i=0;
            found=false;
            while((i < markets.data.length) && (found == false)) {
                if(markets.data[i].symbol == data[j].coin.toLowerCase()) {
                    found = true;
                    coinIds.push(markets.data[i].id);
                }
                i++;
            }
            if(!found) {
                unfound.push(data[j])
            }
        }
	    console.log("Found:");
	    console.log(coinIds);
        console.log("Unfound:");
        console.log(unfound);
        if(unfound.length > 0) {
            CoinGeckoClient.coins.markets({per_page:[250],page:[2]}).then((markets2) => {
                for(j=0;j<unfound.length;j++) {
                    i=0;
                    found=false;
                    while((i < markets2.data.length) && (found == false)) {
                        if(markets2.data[i].symbol == unfound[j].coin.toLowerCase()) {
                            found = true;
                            coinIds.push(markets2.data[i].id);
                        }
                        i++;
                    }
                }
                CoinGeckoClient.simple.price({
                    ids:[coinIds],
                    vs_currencies:['usd']
                }).then((result) => {
                    console.log(result.data);
		    console.log(result.data[coinIds[0]].usd);
                }).catch(console.error)
            }).catch(console.error)
        } else {
            CoinGeckoClient.simple.price({
                ids:[coinIds],
                vs_currencies:['usd']
            }).then((result) => {
		console.log(result.data);
                console.log(result.data[coinIds[0]].usd);
            }).catch(console.error)
        }
    }).catch(console.error)
});

module.exports = con;

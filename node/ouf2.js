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
	console.log(result);
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
                    console.log("In loop");
                    console.log(coinIds);
                }
                i++;
            }
            console.log("Loop end");
            console.log(coinIds);
            if(!found) {
                unfound.push(data[j].coin.toLowerCase())
            }
        }
        console.log("Unfound:");
        console.log(unfound);
        CoinGeckoClient.coins.markets({per_page:[100],page:[3]}).then((markets2) => {
            for(j=0;j<unfound.length;j++) {
                i=0;
                found=false;
                while((i < markets2.data.length) && (found == false)) {
                    if(markets2.data[i].symbol == unfound[j].coin) {
                        found = true;
                        coinIds.push(markets2.data[i].id);
                        console.log("In loop");
                        console.log(coinIds);
                    }
                    i++;
                }
                console.log("Loop end2");
                console.log(coinIds);
            }
        }).catch(console.error)
    }).catch(console.error)
});

module.exports = con;
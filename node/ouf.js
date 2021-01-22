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
	CoinGeckoClient.coins.markets({per_page:[100],page:[1]}).then((markets) => {
        console.log("Markets?");
        console.log(markets);
        i=0;
        found=false;
        while((i < markets.data.length) && (found == false)) {
            if(markets.data[i].symbol == data[j].coin) {
                found = true;
                coinIds.push(markets.data[i].id);
                console.log("In loop");
                console.log(coinIds);
            }
            i++;
        }
        console.log("Loop end");
        console.log(coinIds);
	}).catch(console.error)
});

module.exports = con;
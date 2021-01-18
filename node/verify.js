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
	var list,found,i;
	var coinIds = [];
	CoinGeckoClient.coins.list().then((results) => {
	  for(j=0;j<data.length;j++) {
	    console.log("j:"+j);
	    list = results;
	    found = false;
	    i = 0;
	    while((i < list.data.length) && (found == false)) {
   		    if(list.data[i].symbol == data[j].coin){
			    found = true;
    			    coinIds.push(list.data[i].id);
			    console.log(coinIds);
    		    }
		i++;
    	    }
	  }
	  CoinGeckoClient.simple.price({
		  ids:[coinIds],
		  vs_currencies:['usd']
	  }).then((result) => {
		  console.log(result.data);
	  }).catch(console.error)
	}).catch(console.error)
});

module.exports = con;

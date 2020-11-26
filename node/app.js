const http = require('http');
const fs = require('fs');
const db = require('./verify.js');

const hostname = '0.0.0.0';
const port = 80;


const CoinMarketCap = require('coinmarketcap-api')
 
const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)
const price1 = 19057.069470388597;
const usdtoeuro = 0.842525;
const eurotousd = 1.19;

var holdings = 0;
var deposits = 0;
var coins = ['BTC','ETH','LINK','SXP','MATIC','RSR','VET'];

const server = http.createServer((req,res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type','text/plain');
	res.write("Profits:\n");
	i=0;
	client.getQuotes({symbol: ['BTC,ETH']}).then((prices) => {
//		for(i=0;i<2;i++){
			var sql1 = "SELECT SUM(amount) AS depositSum FROM deposits WHERE coin = '"+coins[i]+"'";
			var sql2 = "SELECT SUM(amount) AS bitcoin FROM posessions WHERE coin = '"+coins[i]+"'";
			db.query(sql1, function(err,result,fields){
				if(err) throw err;
				res.write("BTC Deposits: ");
				deposits = result[0].depositSum;
				res.write(deposits.toString());
				res.write("\nBTC Holdings: ");
				db.query(sql2, function(err,result2,fields2) {
					if(err) throw err;
					holdings = result2[0].bitcoin;
					res.write(holdings.toString());
					res.write("\nBTC price: ");
					console.log("i: " + i);
					console.log(prices);
					cmcprice = prices.data[coins[i]].quote.USD.price;
					res.write(cmcprice.toString());
//					res.write(price1.toString());
					res.write("\nProfit: ");
					res.write(((holdings * cmcprice * usdtoeuro) - deposits).toString());
					res.write("\n------------------");
					if(i==0) res.end();
				});
			});
//		}
	}).catch(console.error)
});

/*
const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  fs.readFile('./html/index.html',null,function(error,data) {
	  if(error) {
		  res.writeHead(404);
		  res.write("Whoops! File not found!");
	  } else {
		  res.write(data);
	  }
	  res.end();
  });
});*/

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


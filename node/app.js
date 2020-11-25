const http = require('http');
const fs = require('fs');
const db = require('./verify.js');

const hostname = '0.0.0.0';
const port = 80;


const CoinMarketCap = require('coinmarketcap-api')
 
//const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
//const client = new CoinMarketCap(apiKey)
const price1 = 19057.069470388597;

const server = http.createServer((req,res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type','text/plain');
	res.write("Profits:\n");
//	client.getQuotes({symbol: ['BTC,ETH']}).then((prices) => {
		var sql1 = "SELECT SUM(amount) AS depositSum FROM deposits";
		var sql2 = "SELECT SUM(amount) AS bitcoin FROM posessions WHERE coin = 'BTC'";
		db.query(sql1, function(err,result,fields){
			if(err) throw err;
			res.write("Deposits: ");
			res.write(result[0].depositSum.toString());
			res.write("\nBTC Holdings: ");
			db.query(sql2, function(err,result2,fields2) {
				if(err) throw err;
				res.write(result2[0].bitcoin.toString());
				res.write("\nBTC price: ");
//			res.write(prices.data.BTC.quote.USD.price.toString());
			res.write(price1.toString());
			res.end();
			});
		});
//	}).catch(console.error)
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


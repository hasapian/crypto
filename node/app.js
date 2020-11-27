const http = require('http');
const fs = require('fs');
const db = require('./verify.js');

const hostname = '0.0.0.0';
const port = 80;


const CoinMarketCap = require('coinmarketcap-api')
/* 
const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)
*/
const price1 = 19057.069470388597;
const usdtoeuro = 0.842525;
const eurotousd = 1.19;

var coins = ['BTC','ETH','LINK','CRO','SXP','MATIC','RSR','VET','BLZ'];
var deposits = [0,0,0,0,0,0,0,0,0];
var posessions = [0,0,0,0,0,0,0,0,0];

const server = http.createServer((req,res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type','text/plain');
	res.write("Profits:\n");
//	client.getQuotes({symbol: ['BTC,ETH']}).then((prices) => {
			var sql1 = "SELECT SUM(amount) AS depBTC FROM deposits WHERE coin = '"+coins[0]+"'";
			var sql2 = "SELECT SUM(amount) AS bitcoin FROM posessions WHERE coin = '"+coins[0]+"'";
			var sql3 = "SELECT SUM(amount) AS depETH FROM deposits WHERE coin = '"+coins[1]+"'";
			var sql4 = "SELECT SUM(amount) AS ether FROM posessions WHERE coin = '"+coins[1]+"'";
			var sql5 = "SELECT SUM(amount) AS depLINK FROM deposits WHERE coin = '"+coins[2]+"'";
			var sql6 = "SELECT SUM(amount) AS chainlink FROM posessions WHERE coin = '"+coins[2]+"'";
			var sql7 = "SELECT SUM(amount) AS depCRO FROM deposits WHERE coin = '"+coins[3]+"'";
			var sql8 = "SELECT SUM(amount) AS cro FROM posessions WHERE coin = '"+coins[3]+"'";
			var sql9 = "SELECT SUM(amount) AS depSXP FROM deposits WHERE coin = '"+coins[4]+"'";
			var sql10 = "SELECT SUM(amount) AS swipe FROM posessions WHERE coin = '"+coins[4]+"'";
			var sql11 = "SELECT SUM(amount) AS depMATIC FROM deposits WHERE coin = '"+coins[5]+"'";
			var sql12 = "SELECT SUM(amount) AS matic FROM posessions WHERE coin = '"+coins[5]+"'";
			var sql13 = "SELECT SUM(amount) AS depRSR FROM deposits WHERE coin = '"+coins[6]+"'";
			var sql14 = "SELECT SUM(amount) AS reserve FROM posessions WHERE coin = '"+coins[6]+"'";
			var sql15 = "SELECT SUM(amount) AS depVET FROM deposits WHERE coin = '"+coins[7]+"'";
			var sql16 = "SELECT SUM(amount) AS vechain FROM posessions WHERE coin = '"+coins[7]+"'";
			var sql17 = "SELECT SUM(amount) AS depBLZ FROM deposits WHERE coin = '"+coins[8]+"'";
			var sql18 = "SELECT SUM(amount) AS bluzelle FROM posessions WHERE coin = '"+coins[8]+"'";
			db.query(sql1, function(err,result,fields){
				if(err) throw err;
				deposits[0] = result[0].depBTC;
				db.query(sql2, function(err,result2,fields2) {
					if(err) throw err;
					posessions[0] = result2[0].bitcoin;
					db.query(sql3, function(err,result3,fields3) {
						if(err) throw err;
						deposits[1] = result3[0].depETH;
						db.query(sql4, function(err,result4,fields4) {
							if(err) throw err;
							posessions[1] = result4[0].ether;
							db.query(sql5, function(err,result5,fields5) {
								if(err) throw err;
								deposits[2] = result5[0].depLINK;

//					cmcprice = prices.data[coins[i]].quote.USD.price;
//					res.write(((holdBTC * cmcprice * usdtoeuro) - deposits[0]).toString());
//					res.write(((holdBTC * price1 * usdtoeuro) - deposits[0]).toString());
							for(i=0;i<2;i++){					
								res.write("\nDeposits: "+deposits[i].toString());
								res.write("\nHoldings: "+posessions[i].toString());
								res.write("\nPrice: "+price1.toString());
								res.write("\nProfit: "+((posessions[i] * price1 * usdtoeuro) - deposits[i]).toString());
								res.write("\n---------");
								if(i==1) res.end();
							}
						});
					});
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


const http = require('http');
const fs = require('fs');
const mysql = require('mysql');
//const spyros = require('./dbhandler.js');
const db = require('./verify.js');

const hostname = '0.0.0.0';
const port = 80;

/*
const CoinMarketCap = require('coinmarketcap-api')
 
const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)

client.getQuotes({symbol: ['BTC', 'ETH']}).then(console.log).catch(console.error)
*/

const server = http.createServer((req,res) => {
	res.statusCode = 200;
	res.setHeader('Content-Type','text/plain');
	res.write("Spyros\n");
	var sql = "SELECT SUM(amount) AS spyros FROM deposits";
	db.query(sql, function(err,result,fields){
		if(err) throw err;
		console.log(result);
		res.write(result[0].spyros.toString());
		res.end();
	});
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


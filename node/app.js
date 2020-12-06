const http = require('http');
const fs = require('fs');
const db = require('./verify.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const createExchange = require('live-currency-exchange')

const app = express();
const exchange = createExchange();

const hostname = '0.0.0.0';
const port = 80;


const CoinMarketCap = require('coinmarketcap-api')
 

const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)


var usdtoeuro = 0.842525;
var eurotousd = 1.21; //should never be used. Rate got from exchange

//	         0     1     2	    3     4      5      6     7     8     9     10
const coins = ['BTC','ETH','LINK','CRO','SXP','MATIC','RSR','VET','BLZ','DOT','ADA'];
var deposits = new Array(coins.length).fill(0);
var posessions = new Array(coins.length).fill(0);
var trades = new Array(coins.length).fill(0);
var priceIn = 'USD';

app.get('/', (req,res) => {
 res.statusCode = 200;
 res.setHeader('Content-Type','text/html');
 res.write("<h1>Profits:</h1>\n");
 client.getQuotes({symbol: ['BTC,ETH,LINK,CRO,SXP,MATIC,RSR,DOT,VET,BLZ,ADA'], convert: priceIn}).then((prices) => {
  var sql = "SELECT SUM(amount) AS totalDeposits FROM deposits";
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
  var sql11 = "SELECT * FROM trades";
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
       db.query(sql6, function(err,result6,fields6) {			
	if(err) throw err;
	posessions[2] = result6[0].chainlink;
	db.query(sql7, function(err,result7) {
	 if(err) throw err;
	 deposits[3] = result7[0].depCRO;
	 db.query(sql8, function(err,result8) {
	  if(err) throw err;
	  posessions[3] = result8[0].cro;
	  db.query(sql9, function(err,result9) {
	   if(err) throw err;
	   deposits[4] = result9[0].depSXP;
	   db.query(sql10, function(err,result10) {
	    if (err) throw err;
	    posessions[4] = result10[0].swipe;
	    db.query(sql, function(err,result) {
	     if(err) throw err;
	     totalDeposits = result[0].totalDeposits;
	     db.query(sql11, function(err,result99) {
	      if(err) throw err;
	      for(j=0;j<result99.length;j++) { //run through the trades table
		 switch(result99[j].coin) {
			 case 'MATIC':
				 trades[5] += result99[j].amount;
				 break;
			 case 'RSR':
				 trades[6] += result99[j].amount;
				 break;
			 case 'VET':
				 trades[7] += result99[j].amount;
				 break;
			 case 'BLZ':
				 trades[8] += result99[j].amount;
				 break;
			 case 'DOT':
				 trades[9] += result99[j].amount;
				 break;
			 case 'ADA':
				 trades[10] += result99[j].amount;
				 break;
			 default:
				 console.log("No match!");
		 }
	      }
	      db.query(sql12, function(err,result) {
	       if(err) throw err;
	       posessions[5] = result[0].matic;
	       db.query(sql14, function(err,result) {
		if(err) throw err;
		posessions[6] = result[0].reserve;
		db.query(sql16, function(err, result) {
	         if(err) throw err;
		 posessions[7] = result[0].vechain;
		 db.query(sql18, function(err, result) {
		  if(err) throw err;
	          posessions[8] = result[0].bluzelle;
	          db.query("SELECT SUM(amount) AS polkadot FROM posessions WHERE coin = 'DOT'", function(err,result) {
	           if(err) throw err;
	           posessions[9] = result[0].polkadot;
		   db.query("SELECT SUM(amount) AS cardano FROM posessions WHERE coin = 'ADA'", function(err,result) {
		    if(err) throw err;
		    posessions[10] = result[0].cardano;
              exchange.convert({source: 'USD', target: 'EUR'}).then((result) => {
               usdtoeuro = result.rate;
   	       var sumOfPosessions = 0;
	       for(i=0;i<11;i++){
	        res.write("\n"+coins[i]);
	        res.write("\nDeposits: "+(deposits[i]+trades[i]).toString()+"<br>");
	        res.write("\nHoldings: "+posessions[i].toString()+"<br>");
	        cmcprice = prices.data[coins[i]].quote[priceIn].price;
	        res.write("\nPrice: "+cmcprice.toString()+"<br>");
	        var tempValue = (priceIn == 'USD') ? posessions[i] * cmcprice * usdtoeuro : posessions[i] * cmcprice;
		       console.log("i:"+i+" trade[i]:"+trades[i]); 
	        res.write("\nProfit: "+(tempValue - ( deposits[i] + trades[i] * usdtoeuro )).toString()+"<br>");
	        res.write("\n---------<br>");
	        sumOfPosessions += tempValue;
	        if(i==10) { 
	         res.write("Total Holdings Value: "+sumOfPosessions+"<br>");
	         res.write("Total Deposits: "+totalDeposits+"<br>");
	         res.write("P&L: "+(sumOfPosessions - totalDeposits)+"<br>");
	         res.write('<a href="\add">Add holdings!</a>');
	         res.end();
	        } //end if
	       } //end for
              }).catch(console.error)  //exchange
		   }); //ada sql	 
	          }); //dot sql
	         }); //sql 18
	        }); //sql16
	       }); //sql14
	      }); //sql12
	     });		     
	    });
	   });
	  });
	 });
	});
       });
      });
     });
    });
   });
  });
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

app.get('/add', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/index.html'));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/updateHolding', function(req,res) {
	cosole.log("Holding updated");
});

app.post('/insertHolding', function (req,res) {
	var amount = req.body.hodl;
	var coin = req.body.coins;
	console.log("coin: "+coin);
	console.log("amount: "+amount);
	var sql = "INSERT INTO posessions (coin,amount) VALUES ('"+coin+"','"+amount+"')"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
		if(err) throw err;
		console.log("New holding has been added");
		res.send("New holding has been added");
	});
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});


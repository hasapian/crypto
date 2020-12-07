const http = require('http');
const fs = require('fs');
const db = require('./verify.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const CoinMarketCap = require('coinmarketcap-api')
const createExchange = require('live-currency-exchange');

const app = express();
const exchange = createExchange();
const port = 80;
const priceIn = 'USD';
const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)

var usdtoeuro = 0.842525;
var eurotousd = 1.21; //should never be used. Rate got from exchange

//	         0     1     2	    3     4      5      6     7     8     9     10
const coins = ['BTC','ETH','LINK','CRO','SXP','MATIC','RSR','VET','BLZ','DOT','ADA'];
var deposits = new Array(coins.length).fill(0);
var posessions = new Array(coins.length).fill(0);
var trades = new Array(coins.length).fill(0);

const sqlDeposits = "SELECT * FROM deposits"
const sqlPosessions = "SELECT * FROM posessions"
const sqlTrades = "SELECT * FROM trades"

var depositResult,posessionsResult,tradesResult;
var totalDeposits,stablecoins;

function myFilltable(result,x) {
    if(x==1)
        totalDeposits = 0;
    for(i=0;i<result.length;i++) {
        var amount = result[i].amount;
        switch(result[i].coin) {
            case 'BTC':
                switch(x) {
                    case 1:
                        deposits[0]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[0]+=amount;
                        break;
                    case 3:
                        trades[0]+=amount;
                        break;
                    default:
                        //should do nothing
                }
                break;
            case 'ETH':
                switch(x) {
                    case 1:
                        deposits[1]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[1]+=amount;
                        break;
                    case 3:
                        trades[1]+=amount;
                        break;
                    default:
                        //should do nothing
                }
                break;
            case 'LINK':
                switch(x) {
                    case 1:
                        deposits[2]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[2]+=amount;
                        break;
                    case 3:
                        trades[2]+=amount;
                        break;
                    default:
                        //should do nothing
                }
                break;
            case 'CRO':
                switch(x) {
                    case 1:
                        deposits[3]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[3]+=amount;
                        break;
                    case 3:
                        trades[3]+=amount;
                        break;
                    default:
                        //should do nothing
                }
                break;
            case 'SXP':
                switch(x) {
                    case 1:
                        deposits[4]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[4]+=amount;
                        break;
                    case 3:
                        trades[4]+=amount;
                        break;
                    default:
                        //should do nothing
                }
                break;
            case 'MATIC':
                switch(x) {
                    case 1:
                        deposits[5]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[5]+=amount;
                        break;
                    case 3:
                        trades[5]+=amount;
                        break;
                    default:
                        //should do nothing
                }
		        break;
            case 'RSR':
                switch(x) {
                    case 1:
                        deposits[6]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[6]+=amount;
                        break;
                    case 3:
                        trades[6]+=amount;
                        break;
                    default:
                        //should do nothing
                }
		        break;
            case 'VET':
                switch(x) {
                    case 1:
                        deposits[7]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[7]+=amount;
                        break;
                    case 3:
                        trades[7]+=amount;
                        break;
                    default:
                        //should do nothing
                }
		        break;
            case 'BLZ':
                switch(x) {
                    case 1:
                        deposits[8]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[8]+=amount;
                        break;
                    case 3:
                        trades[8]+=amount;
                        break;
                    default:
                        //should do nothing
                }
		        break;
            case 'DOT':
                switch(x) {
                    case 1:
                        deposits[9]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[9]+=amount;
                        break;
                    case 3:
                        trades[9]+=amount;
                        break;
                    default:
                        //should do nothing
                }
		        break;
            case 'ADA':
                switch(x) {
                    case 1:
                        deposits[10]+=amount;
                        totalDeposits+=amount;
                        break;
                    case 2:
                        posessions[10]+=amount;
                        break;
                    case 3:
                        trades[10]+=amount;
                        break;
                    default:
                        //should do nothing
                }
                break;
            case 'USDT':
                if(x==2)
                    stablecoins = amount;
                break;
            default:
                if(x==1)
                    totalDeposits+=amount;
        }
    }
}

app.get('/', (req,res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.write("<h1>Profits:</h1>\n");
    client.getQuotes({symbol: ['BTC,ETH,LINK,CRO,SXP,MATIC,RSR,DOT,VET,BLZ,ADA'], convert: priceIn}).then((prices) => {
        db.query(sqlDeposits, function(err,result) {
            if(err) throw err;
            depositResult = result;
            deposits.fill(0);
            myFilltable(result,1);
            db.query(sqlPosessions, function(err,result) {
                if(err) throw err;
                posessionsResult = result;
                posessions.fill(0);
                myFilltable(result,2);
                db.query(sqlTrades, function(err,result) {
                    if(err) throw err;
                    tradesResult = result;
                    trades.fill(0);
                    myFilltable(result,3);
                    exchange.convert({source: 'USD', target: 'EUR'}).then((result) => {
                        usdtoeuro = result.rate;
                        var sumOfPosessions = 0;
                        for(i=0;i<coins.length;i++){
                            res.write("\n"+coins[i]);
                            res.write("\nDeposits: "+(deposits[i] + trades[i] * usdtoeuro).toString()+"<br>");
                            res.write("\nHoldings: "+posessions[i].toString()+"<br>");
                            cmcprice = prices.data[coins[i]].quote[priceIn].price;
                            res.write("\nPrice: "+cmcprice.toString()+"<br>");
                            var tempValue = (priceIn == 'USD') ? posessions[i] * cmcprice * usdtoeuro : posessions[i] * cmcprice;
                            res.write("\nProfit: "+(tempValue - ( deposits[i] + trades[i] * usdtoeuro )).toString()+"<br>");
                            res.write("\n---------<br>");
                            sumOfPosessions += tempValue;
                            if(i==(coins.length-1)) { 
                                res.write("Total Holdings Value: "+sumOfPosessions+"<br>");
                                res.write("Total Deposits: "+totalDeposits+"<br>");
                                res.write("P&L: "+(sumOfPosessions - totalDeposits)+" (plus "+stablecoins+" stablecoins = "+stablecoins * usdtoeuro+" EURO)<br>");
                                res.write('<a href="\add">Add holdings!</a>');
                                res.end();
                            } //end if
                        } //end for
                    }).catch(console.error)  //exchange
                });
            });
        });
    }).catch(console.error)
});


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

app.get('/updateStable', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/mystable.html'));
});

app.post('/updateStablecoins', function (req,res) {
    var amount = req.body.stable;
    var sql = "UPDATE posessions SET amount = "+amount+" WHERE coin = 'USDT'"
    db.query(sql, function(err,result) {
        if(err) throw err;
        res.send("USDT updated!");
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

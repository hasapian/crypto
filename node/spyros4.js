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

//	             0     1     2	    3     4      5      6     7     8     9     10    11
const coins = ['BTC','ETH','LINK','CRO','SXP','MATIC','RSR','VET','BLZ','DOT','ADA','CEL'];
const CoinsEnum = {BTC:0,ETH:1,LINK:2,CRO:3,SXP:4,MATIC:5,RSR:6,VET:7,BLZ:8,DOT:9,ADA:10,CEL:11};
Object.freeze(CoinsEnum);
var deposits = new Array(coins.length).fill(0);
var holdings = new Array(coins.length).fill(0);
var values = new Array(coins.length).fill(0);

const sqlHoldings = "SELECT * FROM holdings"

var holdingsResult;
var totalDeposits,stableOrFiat;

function myFilltable(result,usdtoeuro) {
    totalDeposits = 0;
    stableOrFiat = 0;

    for(i=0;i<result.length;i++) {
        var depositAmount = result[i].deposit;
        if(result[i].depositCurrency == 'USDT')
            depositAmount = depositAmount * usdtoeuro;
        if(result[i].totalDeposits)
            totalDeposits+=depositAmount;

        var coinIndex = CoinsEnum[result[i].coin];
        var amount = result[i].amount;
            
        if(result[i].coin == 'USDT' || result[i].coin == 'EUR') {
            if(result[i].coin == 'USDT')
                amount = amount * usdtoeuro;
            stableOrFiat+=amount;
        }
        else {
            holdings[coinIndex]+=amount;
            deposits[coinIndex]+=depositAmount;
        }
            
    }

}

app.get('/', (req,res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.write("<h1>Work In progress</h1>\n");
    client.getQuotes({symbol: ['BTC,ETH,LINK,CRO,SXP,MATIC,RSR,DOT,VET,BLZ,ADA,CEL'], convert: priceIn}).then((prices) => {
        exchange.convert({source: 'USD', target: 'EUR'}).then((result) => {
            usdtoeuro = result.rate;
            db.query(sqlHoldings, function(err,result) {
                if(err) throw err;
                holdingsResult = result;
                deposits.fill(0);
                holdings.fill(0);
                myFilltable(result,usdtoeuro);
                var sumOfPosessions = 0;
                for(i=0;i<coins.length;i++){
                    res.write("\n"+coins[i]);
                    res.write("\nDeposits: "+(deposits[i]).toString()+"<br>");
                    res.write("\nHoldings: "+holdings[i].toString()+"<br>");
                    cmcprice = prices.data[coins[i]].quote[priceIn].price;
                    res.write("\nPrice: "+cmcprice.toString()+"<br>");
                    var tempValue = (priceIn == 'USD') ? holdings[i] * cmcprice * usdtoeuro : holdings[i] * cmcprice;
                    values[i] = tempValue;
                    res.write("\nProfit: "+(tempValue - deposits[i]).toString()+"<br>");
                    res.write("\n---------<br>");
                    sumOfPosessions += tempValue;
                    if(i==(coins.length-1)) { 
                        res.write("Deposits:<br>")
                        for(j=0;j<coins.length;j++) {
                            var percentage = ((deposits[j]) * 100) / (totalDeposits - stableOrFiat);
                            res.write(coins[j]+": "+Math.round((percentage + Number.EPSILON) * 100) / 100+"%<br>");
                        }
                        res.write("---------<br>");
                        res.write("Portfolio<br>");
                        for(j=0;j<coins.length;j++) {
                            var percentage = (values[j] * 100) / (sumOfPosessions);
                            res.write(coins[j]+": "+Math.round((percentage + Number.EPSILON) * 100) / 100+"%<br>");
                        }
                        res.write("---------<br>");
                        res.write("Total Holdings Value: "+(sumOfPosessions + stableOrFiat)+"<br>");
                        res.write("Total Deposits: "+totalDeposits+"<br>");
                        res.write("<b>P&L: "+((sumOfPosessions + stableOrFiat) - totalDeposits)+"</b><br>");
                        res.write("("+stableOrFiat+" EURO in Fiat or Stablecoins)<br>");
                        // res.write('<a href="\add">Add holdings!</a><br>');
                        // res.write('<a href="\stable">Update Stablecoins!</a><br>');
                        // res.write('<a href="\\trade">Add new trade!</a><br>');                              
                        res.end();
                    } //end if
                } //end for
            });
        }).catch(console.error)  //exchange
    }).catch(console.error)
});


app.get('/add', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/index.html'));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/insertHolding', function (req,res) {
	var amount = req.body.hodl;
    var coin = req.body.coins;
    var wallet = req.body.wallet;
    var isInterest = req.body.isInterest;
	console.log("coin: "+coin);
	console.log("amount: "+amount);
    var sql = "INSERT INTO posessions (coin,amount) VALUES ('"+coin+"','"+amount+"')"
    var sql2 = "INSERT INTO interest (coin,amount,wallet,date) VALUES ('"+coin+"','"+amount+"','"+wallet+"',CURRENT_DATE)"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
        if(err) throw err;
        if(isInterest == "Yes") {
            db.query(sql2, function(err,result) {
                if(err) throw err;
            });
        }
        res.send("New holding has been added");
	});
});

app.get('/stable', function (req,res) {
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

app.get('/holdings', function (req,res) {
    db.query("SELECT * FROM holdings", function(err,result) {
        if(err) throw err;
        // for(i=0;i<result.length;i++) {
        //         res.write(result[i].coin+": ");
        //         res.write(result[i].amount+"\n");
        // }
        res.write("<table>");
        res.write("<tr>");
        for(var column in result[0]){
            res.write("<td><label>" + column + "</label></td>");
        }
        res.write("</tr>");
        for(var row in result){
            res.write("<tr>");
            for(var column in result[row]){
                res.write("<td><label>" + result[row][column] + "</label></td>");       
            }
            res.write("</tr>");         
        }
        res.write("</table>");
	    res.end();
    });
});

/*
app.get('/showInterest', function (req,res) {
    client.getQuotes({symbol: ['BTC,ETH,LINK,CRO,SXP,MATIC,RSR,DOT,VET,BLZ,ADA,CEL'], convert: 'EUR'}).then((prices) => {
        db.query("SELECT * FROM interest WHERE MONTH(date) = MONTH(CURRENT_DATE)", function(err,result) {
            if(err) throw err;
            var sum = 0;
            for(i=0;i<result.length;i++) {
                if(result[i].coin == 'BTC')
                    sum += result[i].amount * prices.data.BTC.quote.EUR.price;
                else if(result[i].coin == 'CRO')
                    sum += result[i].amount * prices.data.CRO.quote.EUR.price;
                else if(result[i].coin == 'ETH')
                    sum += result[i].amount * prices.data.ETH.quote.EUR.price;
                else if(result[i].coin == 'LINK')
                    sum += result[i].amount * prices.data.LINK.quote.EUR.price;
                else if(result[i].coin == 'CEL')
                    sum += result[i].amount * prices.data.CEL.quote.EUR.price;
                res.write(result[i].coin+" - ");
                res.write(result[i].amount+" - ");
                res.write(result[i].wallet+" - ");
                res.write(result[i].date+"\n");
            }
            res.write("Total Interest: " + sum);
            res.end();
        });
    });
});*/

app.get('/monthInterest', function (req,res) {
    var monthValue = req.query.months;
    var option1 = "SELECT * FROM interest WHERE MONTH(date) = MONTH(CURRENT_DATE)"
    var option2 = "SELECT * FROM interest WHERE MONTH(date) = " +monthValue
    var sql = (typeof monthValue !== 'undefined' && monthValue ) ? option2 : option1;
    res.write(sql + "\n");
    client.getQuotes({symbol: ['BTC,ETH,LINK,CRO,SXP,MATIC,RSR,DOT,VET,BLZ,ADA,CEL'], convert: 'EUR'}).then((prices) => {
        db.query(sql, function(err,result) {
            if(err) throw err;
            var sum = 0;
            for(i=0;i<result.length;i++) {
                if(result[i].coin == 'BTC')
                    sum += result[i].amount * prices.data.BTC.quote.EUR.price;
                else if(result[i].coin == 'CRO')
                    sum += result[i].amount * prices.data.CRO.quote.EUR.price;
                else if(result[i].coin == 'ETH')
                    sum += result[i].amount * prices.data.ETH.quote.EUR.price;
                else if(result[i].coin == 'LINK')
                    sum += result[i].amount * prices.data.LINK.quote.EUR.price;
                else if(result[i].coin == 'CEL')
                    sum += result[i].amount * prices.data.CEL.quote.EUR.price;
                res.write(result[i].coin+" - ");
                res.write(result[i].amount+" - ");
                res.write(result[i].wallet+" - ");
                res.write(result[i].date+"\n");
            }
            res.write("Total Interest: " + sum);
            res.end();
        });
    });
});

app.get('/showInterest', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/month.html'));
});

app.get('/runsql', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/runSQL2.html'));
});

app.post('/sqlquery', function (req,res) {
    var sql = req.body.sql;
    db.query(sql, function(err,result) {
        if(err) throw err;
        for(i=0;i<result.length;i++) {
            res.write(result[i].coin+": ");
            res.write(result[i].amount+"\n");
        }
        res.end();
    });
});

app.get('/trade', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/trades.html'));
});

app.post('/updateTrades', function (req,res) {
    var coinAmount = req.body.coinAmount;
    var usdAmount = req.body.usdAmount;
    var coin = req.body.coins;
    var tether = 0;
    var sql = "SELECT amount FROM posessions WHERE coin = 'USDT'"
    var sql2 = "INSERT INTO trades (coin,amount) VALUES ('"+coin+"',"+usdAmount+")"
    var sql3 = "INSERT INTO posessions (coin,amount) VALUES ('"+coin+"',"+coinAmount+")"
    db.query(sql, function(err,result) {
        if(err) throw err;
        tether = result[0].amount;
        db.query(sql2, function(err,result) {
            if(err) throw err;
            console.log("Data inserted into trades")
            db.query(sql3, function(err,result) {
                if(err) throw err;
                console.log("Date inserted into posessions")
                var sql4 = "UPDATE posessions SET amount = "+(tether - usdAmount)+" WHERE coin = 'USDT'";
                db.query(sql4, function(err,result) {
                    if(err) throw err;
                    console.log("USDT amount updated")
                    res.send("All queries performed")
                });
            });
        });
    });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
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

const coins = ['BTC','ETH','LINK','CRO','SXP','MATIC','RSR','VET','BLZ','DOT','ADA','CEL','UNI','GRT'];
const CoinsEnum = {BTC:0,ETH:1,LINK:2,CRO:3,SXP:4,MATIC:5,RSR:6,VET:7,BLZ:8,DOT:9,ADA:10,CEL:11,UNI:12,GRT:13};
const apiCoins = ['BTC,ETH,LINK,CRO,SXP,MATIC,RSR,DOT,VET,BLZ,ADA,CEL,UNI,GRT'];
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
    client.getQuotes({symbol: apiCoins, convert: priceIn}).then((prices) => {
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
                        res.write('<a href="\addInterest">Add Interest</a><br>');
                        res.write('<a href="\addPromo">Add Promo</a><br>');
                        res.write('<a href="\sepa">SEPA Deposit</a><br>');
                        res.write('<a href="\\buyCrypto">Buy Crypto</a><br>');
                        res.write('<a href="\sellCrypto">Sell Crypto</a><br>');
                        res.write('<a href="\cardTransfer">Transfer to card</a><br>');
                        res.write('<a href="\interest">Check interest</a><br>');
                        res.write('<a href="\holdings">Check all holdings</a><br>');  
                        res.write('<a href="\showAllInterest">Check all interest</a><br>');
                        res.write('<a href="\showAllPromos">Check all promos</a><br>');
                        res.write('<a href="\\runSQL">Run SQL query</a><br>');
                        res.end();
                    } //end if
                } //end for
            });
        }).catch(console.error)  //exchange
    }).catch(console.error)
});


app.get('/addInterest', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/addInterest.html'));
});

app.get('/addPromo', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/addPromo.html'));
});

app.get('/buyCrypto', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/buyCrypto2.html'));
});

app.get('/sellCrypto', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/sellCrypto.html'));
});

app.get('/sepa', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/sepa.html'));
});

app.get('/cardTransfer', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/cardTransfer.html'));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/insertInterest', function (req,res) {
    var amount = req.body.amount;
    var coin = req.body.coins;
    var wallet = req.body.wallet;
    var sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date) VALUES ('"+coin+"',"+amount+",'"+wallet+"',true,CURRENT_DATE)"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
	if(err) throw err;
	res.send("Interest added");
	});
});

app.post('/insertPromo', function (req,res) {
    var amount = req.body.amount;
    var coin = req.body.coins;
    var wallet = req.body.wallet;
    var sql = "INSERT INTO holdings (coin,amount,wallet,date,isPromo) VALUES ('"+coin+"',"+amount+",'"+wallet+"',CURRENT_DATE,true)"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
	if(err) throw err;
	res.send("Promo added");
	});
});

app.post('/insertSepa', function (req,res) {
    var amount = req.body.amount;
    var wallet = req.body.wallet;
    var sql = "INSERT INTO holdings (coin,amount,wallet,date,deposit,depositCurrency,totalDeposits) VALUES ('EUR',"+amount+",'"+wallet+"',CURRENT_DATE,"+amount+",true)"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
	if(err) throw err;
	res.send("SEPA added");
	});
});

app.post('/insertPurchase', function (req,res) {
    var amount = req.body.amount;
    var coin = req.body.coins;
    var wallet = req.body.wallet;
    var deposit = req.body.deposit;
    var currency = req.body.currency;
    var price = req.body.price;
    var fees = req.body.fee;
    var totalDeposits = (req.body.totalDeposits == 'Yes') ? true : false; 
    var sql;
    if(totalDeposits) {
        sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date,isPromo,deposit,depositCurrency,price,totalDeposits)"+
        "VALUES ('"+coin+"',"+amount+",'"+wallet+"',false,CURRENT_DATE,false,"+deposit+",'"+currency+"',"+price+",true);"
    }
    else {
        sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date,isPromo,deposit,depositCurrency,price,totalDeposits,fees)"+
        "VALUES ('"+currency+"',-"+amount+",'"+wallet+"',false,CURRENT_DATE,false,0,null,null,false,0),"+
        "('"+coin+"',"+(amount-fees)+",'"+wallet+"',false,CURRENT_DATE,false,"+deposit+",'"+currency+"',"+price+",false,"+fees+");"
    }
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
        if(err) throw err;
        res.send("Holdings updated");
	});
});

app.post('/insertSell', function (req,res) {
    var amount = req.body.amount;
    var coin = req.body.coins;
    var wallet = req.body.wallet;
    var deposit = req.body.deposit;
    var currency = req.body.currency;
    var price = req.body.price;
    var fees = req.body.fee;
    var sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date,isPromo,deposit,depositCurrency,price,totalDeposits,fees)"+
        "VALUES ('"+currency+"',"+(amount-fees)+",'"+wallet+"',false,CURRENT_DATE,false,0,null,null,false,0),"+
        "('"+coin+"',-"+amount+",'"+wallet+"',false,CURRENT_DATE,false,-"+deposit+",'"+currency+"',"+price+",false,"+fees+");"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
        if(err) throw err;
        res.send("Holdings updated");
	});
});

app.post('/insertCard', function (req,res) {
    var amount = req.body.amount;
    var coin = req.body.coins;
    var card = req.body.card;
    var sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date,isPromo,deposit,depositCurrency,totalDeposits)"+
        "VALUES ('"+coin+"',-"+amount+",'"+card+"',false,CURRENT_DATE,false,-"+amount+",'"+coin+"',true);"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
        if(err) throw err;
        res.send("Card transfer completed");
	});
});

function dataInTable(result,res){
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
}

app.get('/holdings', function (req,res) {
    db.query("SELECT * FROM holdings", function(err,result) {
        if(err) throw err;
        dataInTable(result,res);
        res.end();
    });
});

app.get('/interest', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/month.html'));
});

app.get('/monthInterest', function (req,res) {
    var monthValue = req.query.months;
    var option1 = "SELECT * FROM holdings WHERE isInterest = true AND MONTH(date) = MONTH(CURRENT_DATE)"
    var option2 = "SELECT * FROM holdings WHERE isInterest = true AND MONTH(date) = " +monthValue
    var sql = (typeof monthValue !== 'undefined' && monthValue ) ? option2 : option1;
    client.getQuotes({symbol: apiCoins, convert: 'EUR'}).then((prices) => {
        db.query(sql, function(err,result) {
            if(err) throw err;
            var sum = 0;
            dataInTable(result,res);
            for(i=0;i<result.length;i++) {
                sum += result[i].amount * prices.data[result[i].coin].quote.EUR.price;
            }
            res.write("<br>Total Interest: " + sum);
            res.end();
        });
    });
});

app.get('/showAllInterest', function (req,res) {
    var sql = "SELECT * FROM holdings WHERE isInterest = true"
    client.getQuotes({symbol: apiCoins, convert: 'EUR'}).then((prices) => {
        db.query(sql, function(err,result) {
            if(err) throw err;
            var sum = 0;
            dataInTable(result,res);
            for(i=0;i<result.length;i++) {
                sum += result[i].amount * prices.data[result[i].coin].quote.EUR.price;
            }
            res.write("<br>Total Interest: " + sum + " EUR");
            res.end();
        });
    });
});

app.get('/showAllPromos', function (req,res) {
    var sql = "SELECT * FROM holdings WHERE isPromo = true"
    client.getQuotes({symbol: apiCoins, convert: 'EUR'}).then((prices) => {
        db.query(sql, function(err,result) {
            if(err) throw err;
            var sum = 0;
            dataInTable(result,res);
            for(i=0;i<result.length;i++) {
                sum += result[i].amount * prices.data[result[i].coin].quote.EUR.price;
            }
            res.write("<br>Promos Value: " + sum + " EUR");
            res.end();
        });
    });
});


app.get('/runsql', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/runSQL.html'));
});

app.post('/sqlquery', function (req,res) {
    var sql = req.body.sql;
    db.query(sql, function(err,result) {
        if(err) throw err;
        dataInTable(result,res);
        res.write("<br>Query executed");
        res.end();
    });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
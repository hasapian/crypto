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

//	             0     1     2	    3     4      5      6     7     8     9     10    11   12
const coins = ['BTC','ETH','LINK','CRO','SXP','MATIC','RSR','VET','BLZ','DOT','ADA','CEL','UNI'];
const CoinsEnum = {BTC:0,ETH:1,LINK:2,CRO:3,SXP:4,MATIC:5,RSR:6,VET:7,BLZ:8,DOT:9,ADA:10,CEL:11,UNI:12};
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
    client.getQuotes({symbol: ['BTC,ETH,LINK,CRO,SXP,MATIC,RSR,DOT,VET,BLZ,ADA,CEL,UNI'], convert: priceIn}).then((prices) => {
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
                        res.write('<a href="\add">Add holding</a><br>');
                        res.write('<a href="\interest">Check interest</a><br>');
                        res.write('<a href="\\runSQL">Run SQL query</a><br>');
			res.write('<a href="\holdings">Check all holdings</a><br>');                              
                        res.end();
                    } //end if
                } //end for
            });
        }).catch(console.error)  //exchange
    }).catch(console.error)
});


app.get('/add', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/addHolding.html'));
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/insertHolding', function (req,res) {
    var amount = req.body.amount;
    var coin = req.body.coins;
    var wallet = req.body.wallet;
    var isInterest = req.body.isInterest;
    var interest = (req.body.isInterest == 'Yes') ? true : false;  
    var sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date) VALUES ('"+coin+"',"+amount+",'"+wallet+"',"+interest+",CURRENT_DATE)"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
        if(err) throw err;
        res.send("New holding has been added");
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
    //res.write(sql + "\n");
    client.getQuotes({symbol: ['BTC,ETH,LINK,CRO,SXP,MATIC,RSR,DOT,VET,BLZ,ADA,CEL,UNI'], convert: 'EUR'}).then((prices) => {
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


app.get('/runsql', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/runSQL.html'));
});

app.post('/sqlquery', function (req,res) {
    var sql = req.body.sql;
    db.query(sql, function(err,result) {
        if(err) throw err;
        dataInTable(result,res);
        res.end();
    });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

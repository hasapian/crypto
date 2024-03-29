const db = require('./verify.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const CoinMarketCap = require('coinmarketcap-api')
const CoinGecko = require('coingecko-api')

const app = express();
const port = 80;
const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)
const CoinGeckoClient = new CoinGecko();

const stablecoins = ['USDT','USDC','BUSD'];
const sqlHoldings = "SELECT * FROM holdings"
const sqlCoins = "SELECT * FROM coins"

var geckoIndex;
var totalDeposits,stableOrFiat;
var deposits,holdings,values;
var coinIndexes = {};
var symbolId = {};

function myFilltable(result,prices) {
    totalDeposits = 0;
    stableOrFiat = 0;

    var geckoprice;
    for(i=0;i<result.length;i++) {
        var depositAmount = result[i].deposit;

        if((result[i].depositCurrency != 'EUR') && (result[i].depositCurrency != null)) {
            geckoprice = prices.data[symbolId[result[i].depositCurrency]].eur;
            depositAmount = depositAmount * geckoprice;
        }
            
        if(result[i].totalDeposits)
            totalDeposits+=depositAmount;

        var coinIndex = coinIndexes[result[i].coin];
        var amount = result[i].amount;
            
        if(result[i].coin == 'EUR' || stablecoins.includes(result[i].coin)) {
            if(stablecoins.includes(result[i].coin)) {
                geckoprice = prices.data[symbolId[result[i].coin]].eur;
                amount = amount * geckoprice;
            }
            stableOrFiat+=amount;
        }
        else {
            holdings[coinIndex]+=amount;
            deposits[coinIndex]+=depositAmount;
        }    
    }
}

function getKeyByValue(object, value) {
    return Object.keys(object).find(key => object[key] === value);
}

function myround(x) {
    return (Math.round((x + Number.EPSILON) * 100) /100);
}

app.get('/', (req,res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.write("<h1>Crypto</h1>\n");
    db.query(sqlCoins, function(err,mycoins) {
        if(err) throw err;
        geckoIndex = 0;
        var coins = [];
        var geckoIds = [];
        coinIndexes = {};
        symbolId = {};
        deposits = new Array(mycoins.length).fill(0);
        holdings = new Array(mycoins.length).fill(0);
        values = new Array(mycoins.length).fill(0);
        mycoins.forEach(function(coin) {
            coins.push(coin.coin);
        });
        var unfound = [];
        CoinGeckoClient.coins.markets({per_page:[250],page:[1]}).then((markets) => {
            for(j=0;j<coins.length;j++) {
                i=0;
                found=false;
                while((i < markets.data.length) && (found == false)) {
                    if(markets.data[i].symbol == coins[j].toLowerCase()) {
                        found = true;
                        geckoIds.push(markets.data[i].id);
                        coinIndexes[coins[j]] = geckoIndex;
                        symbolId[coins[j]] = markets.data[i].id;
                        geckoIndex++;
                    }
                    i++;
                }
                if(!found) {
                    unfound.push(coins[j])
                }
            }
            console.log(unfound);
            CoinGeckoClient.coins.markets({per_page:[250],page:[2]}).then((markets2) => {
                for(j=0;j<unfound.length;j++) {
                    i=0;
                    found=false;
                    while((i < markets2.data.length) && (found == false)) {
                        if(markets2.data[i].symbol == unfound[j].toLowerCase()) {
                            found = true;
                            geckoIds.push(markets2.data[i].id);
                            coinIndexes[unfound[j]] = geckoIndex;
                            symbolId[unfound[j]] = markets2.data[i].id;
                            geckoIndex++;
                        }
                        i++;
                    }
                }
                console.log(geckoIds);
                console.log(coinIndexes);
                CoinGeckoClient.simple.price({ids: geckoIds,vs_currencies: ['eur','usd'],}).then((prices) => {
                    db.query(sqlHoldings, function(err,result) {
                        if(err) throw err;
                        holdingsResult = result;
                        deposits.fill(0);
                        holdings.fill(0);
                        myFilltable(result,prices);
                        var sumOfPosessions = 0;
                        for(i=0;i<geckoIds.length;i++) {
                            var coinName = getKeyByValue(coinIndexes,i);
                            console.log(coinName);
                            if(!stablecoins.includes(coinName)) {
                                res.write("\n"+coinName);
                                res.write("\nDeposits: "+(myround(deposits[i])).toString()+"<br>");
                                res.write("\nHoldings: "+holdings[i].toString()+"<br>");
                                geckoprice = prices.data[geckoIds[i]].usd;
                                geckoprice2 = prices.data[geckoIds[i]].eur;
                                res.write("\nPrice: "+geckoprice.toString()+"<br>");
                                var tempValue = holdings[i] * geckoprice2;
                                values[i] = tempValue;
                                res.write("\nProfit: "+(myround(tempValue - deposits[i])).toString()+"<br>");
                                res.write("\n---------<br>");
                                sumOfPosessions += tempValue;
                                if(i==(geckoIds.length-1)) { 
                                    res.write("Deposits:<br>")
                                    for(j=0;j<geckoIds.length;j++) {
                                        coinName = getKeyByValue(coinIndexes,j);
                                        if(!stablecoins.includes(coinName)) {
                                            var percentage = ((deposits[j]) * 100) / (totalDeposits - stableOrFiat);
                                            res.write(coinName+": "+myround(percentage)+"%<br>");
                                        }
                                    }
                                    res.write("---------<br>");
                                    res.write("Portfolio<br>");
                                    for(j=0;j<geckoIds.length;j++) {
                                        coinName = getKeyByValue(coinIndexes,j);
                                        if(!stablecoins.includes(coinName)) {
                                            var percentage = (values[j] * 100) / (sumOfPosessions);
                                            res.write(coinName+": "+myround(percentage)+"%<br>");
                                        }
                                    }
                                    res.write("---------<br>");
                                    res.write("Total Holdings Value: "+myround(sumOfPosessions + stableOrFiat)+"<br>");
                                    res.write("Total Deposits: "+myround(totalDeposits)+"<br>");
                                    res.write("<b>P&L: "+myround((sumOfPosessions + stableOrFiat) - totalDeposits)+"</b><br>");
                                    res.write("("+myround(stableOrFiat)+" EURO in Fiat or Stablecoins)<br>");
                                    res.write('<a href="\addInterest">Add Interest</a><br>');
                                    res.write('<a href="\addPromo">Add Promo</a><br>');
                                    res.write('<a href="\sepa">SEPA Deposit</a><br>');
                                    res.write('<a href="\\buyCrypto">Buy Crypto</a><br>');
                                    res.write('<a href="\sellCrypto">Sell Crypto</a><br>');
                                    res.write('<a href="\\transferCrypto">Transfer Crypto</a><br>');
                                    res.write('<a href="\cardTransfer">Transfer to card</a><br>');
                                    res.write('<a href="\cardBack">Transfer from card</a><br>');
                                    res.write('<a href="\interest">Check interest</a><br>');
                                    res.write('<a href="\holdings">Check all holdings</a><br>');  
                                    res.write('<a href="\showAllInterest">Check all interest</a><br>');
                                    res.write('<a href="\showAllPromos">Check all promos</a><br>');
                                    res.write('<a href="\cardTransfers">Check all card transfers</a><br>');
                                    res.end();
                                } //end if
                            } //end if not stablecoin
                        } //end for
                    });
                }).catch(console.error)
            }).catch(console.error) //second market request (250-500)
        }).catch(console.error)
    });
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

app.get('/cardBack', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/cardBack.html'));
});

app.get('/transferCrypto', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/walletTransfer.html'));
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
    var deposit = parseInt(amount) + 1; 
    var wallet = req.body.wallet;
    var sql = "INSERT INTO holdings (coin,amount,wallet,date,deposit,depositCurrency,totalDeposits) VALUES ('EUR',"+amount+",'"+wallet+"',CURRENT_DATE,"+deposit+",'EUR',true)"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
	if(err) throw err;
	res.send("SEPA added");
	});
});

app.post('/transfer', function (req,res) {
    var amount = req.body.amount;
    var coin = req.body.coins;
    var wallet = req.body.wallet;
    var wallet2 = req.body.wallet2;
    var fees = req.body.fee;
    var sql = "INSERT INTO holdings (coin,amount,wallet,date,fees)"+
        "VALUES ('"+coin+"',-"+amount+",'"+wallet+"',CURRENT_DATE,0),"+
        "('"+coin+"',"+(amount-fees)+",'"+wallet2+"',CURRENT_DATE,"+fees+");"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
        if(err) throw err;
        res.send("Transfer completed");
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
        "VALUES ('"+currency+"',-"+deposit+",'"+wallet+"',false,CURRENT_DATE,false,-"+deposit+",'"+currency+"',null,false,0),"+
        "('"+coin+"',"+(amount-fees)+",'"+wallet+"',false,CURRENT_DATE,false,"+deposit+",'"+currency+"',"+price+",false,"+fees+");"
    }
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
        if(err) throw err;
        res.send("Holdings updated");
    });
    db.query(sqlCoins, function (err,coins) {
        if(err) throw err;
        var i=0;
        var found = false;
        while((i<coins.length) && (found == false)) {
            if(coins[i].coin == coin)
                found = true;
            i++;
        }
        if(!found) {
            var sql2 = "INSERT INTO coins (id,coin) VALUES ("+i+",'"+coin+"');"
            console.log(sql2);
            db.query(sql2, function (err,result) {
                if(err) throw err;
            });
        }
	});
});

app.post('/insertSell', function (req,res) {
    var amount = req.body.amount;
    var coin = req.body.coins;
    var wallet = req.body.wallet;
    var amount2 = req.body.deposit;
    var currency = req.body.currency;
    var price = req.body.price;
    var fees = req.body.fee;
    var sql;
    var mycoins = [];
    db.query(sqlCoins, function(err,coins) {
        if(err) throw err;
        coins.forEach(function(coin) {
            mycoins.push(coin.coin);
        });
        client.getQuotes({symbol: mycoins, convert: 'EUR'}).then((prices) => {
            var cmcprice = prices.data[coin].quote.EUR.price;
            console.log("CMC price: "+cmcprice);
            if(currency == 'EUR' || stablecoins.includes(currency)) {
                sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date,isPromo,deposit,depositCurrency,price,totalDeposits,fees)"+
                "VALUES ('"+currency+"',"+(amount2-fees)+",'"+wallet+"',false,CURRENT_DATE,false,0,null,null,false,0),"+
                "('"+coin+"',-"+amount+",'"+wallet+"',false,CURRENT_DATE,false,-"+(amount2-fees)+",'"+currency+"',"+price+",false,"+fees+");"
            }
            else {
                var depositValue = amount * cmcprice;
                console.log("Deposit value: "+depositValue);
                sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date,isPromo,deposit,depositCurrency,price,totalDeposits,fees)"+
                "VALUES ('"+currency+"',"+(amount2-fees)+",'"+wallet+"',false,CURRENT_DATE,false,"+depositValue+",'EUR',null,false,0),"+
                "('"+coin+"',-"+amount+",'"+wallet+"',false,CURRENT_DATE,false,-"+depositValue+",'EUR',"+price+",false,"+fees+");"
            }
            console.log("sql: "+sql);
            db.query(sql, function (err,result) {
                if(err) throw err;
                res.send("Holdings updated");
            });
        });
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

app.post('/tranferBack', function (req,res) {
    var amount = req.body.amount;
    var coin = req.body.coins;
    var card = req.body.wallet;
    var sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date,isPromo,deposit,depositCurrency,totalDeposits)"+
        "VALUES ('"+coin+"',"+amount+",'"+card+"',false,CURRENT_DATE,false,"+amount+",'"+coin+"',true);"
	console.log("sql: "+sql);
	db.query(sql, function (err,result) {
        if(err) throw err;
        res.send("Tranfer from card completed");
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

app.get('/cardTransfers', function (req,res) {
    var sum=0;
    var mycoins = [];
    db.query(sqlCoins, function(err,coins) {
        if(err) throw err;
        coins.forEach(function(coin) {
            mycoins.push(coin.coin);
        });
        client.getQuotes({symbol: mycoins, convert: 'EUR'}).then((prices) => {
            db.query("SELECT * FROM holdings WHERE wallet='Swipe Card' or wallet='MCO Card'", function(err,result) {
                if(err) throw err;
                dataInTable(result,res);
                for(i=0;i<result.length;i++) {
                    sum += result[i].amount * prices.data[result[i].coin].quote.EUR.price;
                }
                res.write("<br>Total Amount: " + sum + " EUR");
                res.end();
            });
        });
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
    var mycoins = [];
    db.query(sqlCoins, function(err,coins) {
        if(err) throw err;
        coins.forEach(function(coin) {
            mycoins.push(coin.coin);
        });
        client.getQuotes({symbol: mycoins, convert: 'EUR'}).then((prices) => {
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
});

app.get('/showAllInterest', function (req,res) {
    var sql = "SELECT * FROM holdings WHERE isInterest = true"
    var mycoins = [];
    db.query(sqlCoins, function(err,coins) {
        if(err) throw err;
        coins.forEach(function(coin) {
            mycoins.push(coin.coin);
        });
        client.getQuotes({symbol: mycoins, convert: 'EUR'}).then((prices) => {
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
});

app.get('/showAllPromos', function (req,res) {
    var sql = "SELECT * FROM holdings WHERE isPromo = true";
    var mycoins = [];
    db.query(sqlCoins, function(err,coins) {
        if(err) throw err;
        coins.forEach(function(coin) {
            mycoins.push(coin.coin);
        });
        client.getQuotes({symbol: mycoins, convert: 'EUR'}).then((prices) => {
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
});

app.get('/runsql', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/runSQL.html'));
});
app.post('/sqlquery', function (req,res) {
    var query = req.body.sql;
    var sql = "SELECT * FROM holdings WHERE id=112;";
    if(typeof query !== 'undefined' && monthValue )
        sql = query;
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

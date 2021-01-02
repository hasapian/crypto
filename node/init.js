  
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "Olt34eedmp",
  database: "cryptoDB"
});

var sql = "INSERT INTO holdings (coin,amount,wallet,isInterest,date,isPromo,deposit,depositCurrency,price,totalDeposits) VALUES "+
"('BTC',0.08517096,'BlockFi',false,NULL,false,1117.25,'EUR',12939.20,true),"+
"('USDT',300,'Binance',false,NULL,false,260.87,'EUR',1.22,true),"+
"('USDT',300,'Binance',false,NULL,false,253.58,'EUR',1.22,true),"+
"('USDT',-300,'Binance',false,NULL,false,260.87,'EUR',1.22,true),"+
"('USDT',-300,'Binance',false,NULL,false,253.58,'EUR',1.22,true),"+
"('BTC',0.025,'Crypto',false,NULL,false,243.26,'EUR',11855.23,true),"+
"('BTC',0.000184,'Crypto',true,'2020-11-14',false,0,NULL,NULL,false),"+
"('BTC',-0.025184,'Crypto',false,NULL,false,-577.48,'USDT',22950,false),"+
"('BTC',0.025511,'Crypto',false,NULL,false,577.48,'USDT',22600,false),"+
"('CRO',10000,'Crypto',false,NULL,false,1320.34,'EUR',0.16,true),"+
"('CRO',320.99451806,'Crypto',false,NULL,true,0,NULL,NULL,false),"+
"('CRO',301.63548194,'Crypto',true,'2020-11-14',false,0,NULL,NULL,false),"+
"('SXP',300,'Swipe',false,NULL,false,313.82,'EUR',NULL,true),"+
"('BTC',0.015,'Celsius',false,NULL,false,0,NULL,NULL,false),"+
"('BTC',0.00107,'Celsius',false,NULL,true,0,NULL,NULL,false),"+
"('BTC',0.00108,'Celsius',false,NULL,true,0,NULL,NULL,false),"+
"('BTC',0.00007,'Celsius',true,'2020-11-14',false,0,NULL,NULL,false),"+
"('ETH',0.995,'Celsius',false,NULL,false,362.41,'EUR',420,true),"+
"('ETH',0.41272,'Celsius',false,NULL,false,150,'EUR',420,true),"+
"('ETH',0.0115,'Celsius',true,'2020-11-14',false,0,NULL,NULL,false),"+
"('LINK',24.7,'Celsius',false,NULL,false,241.32,'EUR',11.76,true),"+
"('LINK',9.968,'Celsius',false,NULL,false,100,'EUR',11.86,false),"+
"('LINK',0.14045,'Celsius',true,'2020-11-14',false,0,NULL,NULL,false),"+
"('MATIC',9031.744,'Celsius',false,NULL,false,171.577275,'USDT',20,false),"+
"('MATIC',28.55097,'Celsius',true,'2020-11-14',false,0,NULL,NULL,false),"+
"('CEL',0.38690,'Celsius',true,'2020-11-14',false,0,NULL,NULL,false),"+
"('USDT',2047,'Celsius',false,NULL,false,2001,'EUR',1.2202,true),"+
"('VET',3455.541,'Binance',false,NULL,false,50,'USDT',0.014464,false),"+
"('VET',9049.941,'Binance',false,NULL,false,134.57037,'USDT',0.015,false),"+
"('RSR',4698.5342,'Binance',false,NULL,false,94.11557400,'USDT',0.020,false),"+
"('BLZ',948.7503,'Binance',false,NULL,false,75.13624600,'USDT',0.07,false),"+
"('ADA',438.8925902,'Binance',false,NULL,false,69.98776100,'USDT',0.15,false),"+
"('MATIC',2762.4585,'Celsius',false,NULL,false,50,'USDT',0.01642,false),"+
"('ADA',847.152,'Binance',false,NULL,false,100,'EUR',0.14,false),"+
"('DOT',21.2601,'Binance',false,NULL,false,105.943865,'USDT',5.05,false),"+
"('DOT',13.036,'Binance',false,NULL,false,50,'EUR',4.68,false),"+
"('BLZ',1031.5674,'Binance',false,NULL,false,50,'USDT',0.04842,false),"+
"('UNI',16.69329,'Binance',false,NULL,false,53.88975,'USDT',3.2250,false),"+
"('LINK',8.388603,'Binance',false,NULL,false,69.94701,'EUR',10.15,false);"

con.connect(function(err) {
  if (err) throw err;
  
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });

});

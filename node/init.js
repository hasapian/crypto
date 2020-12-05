var mysql = require("mysql");

var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "Olt34eedmp",
  database: "cryptoDB"
});

con.connect(function(err) {
  if (err) throw err;
  //perform query
  con.query("INSERT INTO deposits (coin,amount) VALUES ('CRO',1320.34),('BTC',243.26),('SXP',313.82),('ETH',362.41),('BTC',1117.25),('ETH',150),('USTD',260.87),('LINK',241.32),('USDT',253.58);", function (err,result,fields) {
	  if(err) throw err;
	  console.log(result);
  });
  con.query("INSERT INTO posessions (coin,amount) VALUES ('BTC',0.12641696),('ETH',1.41484),('LINK',24.77336),('CRO',10000),('CRO',530.83),('SXP',300),('MATIC',9034.23468),('VET',9049.941),('RSR',4698.5342),('BLZ',948.7503),('DOT',14.8401),('ADA',438.8925902);", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });

  con.query("INSERT INTO trades (coin,amount) VALUES ('MATIC',171.577275),('RSR',94.115574),('VET',134.57037),('BLZ',75.136246),('DOT',74.9925),('ADA',69.987761);", function (err,result,fields) {
	  if(err) throw err;
	  console.log(result);
  });
});

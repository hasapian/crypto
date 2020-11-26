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
  con.query("INSERT INTO posessions (coin,amount) VALUES ('BTC',0.12604724),('ETH',1.41339),('LINK',24.75636);", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

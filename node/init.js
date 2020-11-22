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
  con.query("INSERT INTO deposits (amount) VALUES (1200.37),(500.92);", function (err,result,fields) {
	  if(err) throw err;
	  console.log(result);
  });
  con.query("INSERT INTO posessions (coin,amount) VALUES ('BTC',0.1),('ETH',1.5);", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

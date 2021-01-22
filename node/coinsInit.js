var mysql = require("mysql");

var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "Olt34eedmp",
  database: "cryptoDB"
});

var sql = "INSERT INTO coins (coin) VALUES ('BTC'),('ETH'),('LINK'),('CRO'),('SXP'),('MATIC'),('RSR'),('VET'),('BLZ'),('DOT'),('ADA'),('CEL'),('UNI'),('GRT'),('ZIL'),('AAVE'),('XLM'),('SNX'),('COMP');"

con.connect(function(err) {
  if (err) throw err;
  
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });

});
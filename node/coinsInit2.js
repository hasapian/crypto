var mysql = require("mysql");

var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "Olt34eedmp",
  database: "cryptoDB"
});

var sql = "INSERT INTO coins (id,coin) VALUES (0,'BTC'),(1,'ETH'),(2,'LINK'),(3,'CRO'),(4,'SXP'),(5,'MATIC'),(6,'RSR'),(7,'VET'),(8,'BLZ'),(9,'DOT'),(10,'ADA'),(11,'CEL'),(12,'UNI'),(13,'GRT'),(14,'ZIL'),"+
+"(15,'AAVE'),(16,'XLM'),(17,'SNX'),(18,'COMP');"

con.connect(function(err) {
  if (err) throw err;
  
  con.query(sql, function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });

});
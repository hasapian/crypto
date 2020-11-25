var mysql = require("mysql");

var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "Olt34eedmp",
  database: "cryptoDB"
});

con.connect(function(err) {
  if (err) throw err;
});

/*
function getDepositSum(callback) {
	var sql = "SELECT SUM(amount) as totalDeposits FROM deposits";
	con.query(sql,callback);
}*/

module.exports = con;

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
  con.query("SELECT * FROM deposits", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

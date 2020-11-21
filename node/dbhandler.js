var mysql = require("mysql");

var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "Olt34eedmp",
  database: "foods"
});

con.connect(function(err) {
  if (err) throw err;
  //perform query
  con.query("SELECT * FROM ingredients", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});

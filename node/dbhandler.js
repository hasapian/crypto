module.exports = { getDepositSum }
var mysql = require("mysql");

var con = mysql.createConnection({
  host: "mysql",
  user: "root",
  password: "Olt34eedmp",
  database: "cryptoDB"
});

//con.connect();

function getDepositSum(callback){

	con.connect();

	var sql = "SELECT SUM(amount) AS spyros FROM deposits";

	con.query(sql,function(err,results) {
		if(err) throw err;
//		console.log("1");
//		console.log(results);
		//totalResult = results;
	
		return callback(results);
	});
}


//var totalResult = '';

getDepositSum(function(result){
	//totalResult = result;
	//do sth
	console.log("1");
	console.log(result);
	console.log(result[0].spyros);
	return result;
});

/*
con.connect(function(err) {
  if (err) throw err;
  //perform query
  con.query("SELECT * FROM deposits", function (err,result,fields) {
	  if(err) throw err;
	  console.log(result);
  });
  con.query("SELECT SUM(amount) FROM deposits", function (err, result, fields) {
    if (err) throw err;
    console.log(result);
  });
});*/

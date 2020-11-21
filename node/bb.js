'use strict';

const fetch = require('node-fetch');
const url = 'http://fctables.com/greece/super-league/2018_2019/'
const cheerio = require('cheerio');
var mysql = require("mysql");

var data;

var con = mysql.createConnection({
	host: "mysql",
	user: "root",
	password: "Olt34eedmp",
	database: "teamDB"
});

con.connect(function(err) {
	if(err) throw err;
	else console.log("DB Connected");
});

function existsInDB(team,index) {
	var exists = 0;
	if(index==1){console.log("In function: " + team);}
	con.query("SELECT * FROM teams WHERE name LIKE '%"+team+"%'", function(err,result, fields) {
		if(err) throw err;
		if(index==1) {
		console.log(result);
		console.log("Length: "+ result.length);}
		exists = result.length;
	//	console.log("Result name: "+ result.name);
	//	console.log("Result occur: "+ result.occur);

	
	if (exists > 0) {
		if(index==1){console.log("Return true");}
		return true;
	} else {
		if(index==1){console.log("Return false");}
		return false;
	}});
}


function getTeams(){
	let output = [];
	fetch(url).then(res => res.text()).then(body => {
		const $ = cheerio.load(body);
		$("#league-table tr[data-id] a").each( (index,elem) => {
			let team = $(elem).first().text();
			if(index == 1) { console.log(team);}
			var spyros = existsInDB(team,index); 
			if(!spyros) {
			  if(index==1) {console.log("Team to store in DB: " + team);}
  			  con.query("INSERT INTO teams (name, occur, year) VALUES ('"+team+"','1','2018');");
			}
			output.push(team);
		});
	}).catch(err => {
		console.log(err);
	});
	return output;
}


data = getTeams();

function printdata() {
	console.log(data);
	console.log(data[1]);
	con.end();
}

setTimeout(printdata, 2000);


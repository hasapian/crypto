const db = require('./verify.js');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 80;

app.get('/', (req,res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type','text/html');
    res.write("<h1>Crypto</h1>");
    res.end();
});


app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/test', function (req,res) {
	res.sendFile(path.join(__dirname,'./html/test.html'));
});

// app.post('/sqlquery', function (req,res) {
//     var query = req.body.sql;
//     var sql = "SELECT * FROM holdings WHERE id=112;";
//     if(typeof query !== 'undefined' && monthValue )
//         sql = query;
//     db.query(sql, function(err,result) {
//         if(err) throw err;
//         dataInTable(result,res);
//         res.write("<br>Query executed");
//         res.end();
//     });
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
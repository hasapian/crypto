const http = require('http');

const hostname = '0.0.0.0';
const port = 80;

const CoinMarketCap = require('coinmarketcap-api')
 
const apiKey = 'bf1f6e72-f284-4248-9b91-78625793a01b'
const client = new CoinMarketCap(apiKey)

client.getQuotes({symbol: ['BTC', 'ETH']}).then(console.log).catch(console.error)

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});


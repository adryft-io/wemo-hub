var Wemo         = require('./wemo/index');
var WemoClient   = require('./wemo/client');
var wemo         = new Wemo();
var request      = require( 'request' );
var http = require('http');
var server = http.createServer(function(request, response){
  response.writeHead(200, {'Content-Type': 'text/html'});
  response.end();
});
var client = require("socket.io-client"); 
var socket = client.connect("http://localhost:8080", {'multiplex': false});

socket.on('connect', function (socket) {
  console.log('connected to server');
});

server.listen(8060); 

wemo.load('http://10.6.24.194:49153/setup.xml', function (deviceInfo) {
  var wemoClient = wemo.client(deviceInfo);
  console.log(deviceInfo.UDN.slice(5));
  var message;
  socket.on('message', function (msg) {
    msg = JSON.parse(msg);
    if (msg.reaction_fields.wemoId) { 
      message = msg.action_props.body.match(/turn on|turn off/i)[0].toLowerCase();
      console.log('message after reg ex', message);
      wemoClient.getBinaryState((err,data) => {
        if (err) return console.log(err);
        if (data !== '0' && message === 'turn off') {
          wemoClient.setBinaryState(0, (err, res) => {
            if (err) {
              console.log('err is', err);
            } else {
              console.log('res from turn off code is', res);
            }
          });
        }
        if (data === '0' && message === 'turn on') {
          wemoClient.setBinaryState(1, (err, res) => {
            if (err) {
              console.log('err is', err);
            } else {
              console.log('res from turn off code is', res);
            }
          });
        }
        wemoClient.on('binaryState', (value) => {
          console.log('current value is', value);
        });   
      }); 
    }     
  })
});   

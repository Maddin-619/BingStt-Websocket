var socketio = require('socket.io-client');//('https://speech.platform.bing.com/speech/recognize/interactive/cognitiveservices/v1');
var https = require('https');

var options = {
  host: 'api.cognitive.microsoft.com',
  port: 443,
  path: '/sts/v1.0/issueToken',
  method: 'POST',
  headers:{
    'Ocp-Apim-Subscription-Key':'84517151739b4a4f83ea1ce042cc348c'
  }
};
var req = https.request(options, function(res) {
  console.log(res.statusCode);
  res.on('data', function(d) {
    process.stdout.write(d);
    /*
    var io = socketio('wss://speech.platform.bing.com/speech/recognize/interactive/cognitiveservices/v1',{
        extraHeaders:{
            'Authorization':'Bearer ' + d,
            'ProtoSec-WebSocket-Key':'wPEE5FzwR6mxpsslyRRpgP==',
            'X-ConnectionId':'A140CAF92F71469FA41C72C7B5849253',
            'Sec-WebSocket-Version':13,
        }
    });
    
    var io = socketio.connect('wss://echo.websocket.org');
    io.on('connect',function(){
        console.log('connected');
    })
    //io.connect();
    io.send('test');
    
    process.stdout.write('connected=' + io.connected);
    io.on('',function(data){
        process.stdout.write(data);
    });
    io.emit('send message',' ');
    */
    /*
    options = {
        host: 'speech.platform.bing.com',
        port: 443,
        path: '/speech/recognize/interactive/cognitiveservices/v1',
        method: 'POST',
        headers:{
            'Authorization': 'Bearer ' + d,
            'ProtoSec-WebSocket-Key':'wPEE5FzwR6mxpsslyRRpgP==',
            'X-ConnectionId':'A140CAF92F71469FA41C72C7B5849253',
            'Sec-WebSocket-Version':13,
            'Connection':'Upgrade'
        }
    };

    var handshakeReq = https.request(options, function(result){
        console.log(res.statusCode);
        res.on('data',function(data){
            process.stdout.writable(data);
        });
    });
    handshakeReq.on('error', function(e){
        console.error(e);
    });
    */
  });
});
req.end();

req.on('error', function(e) {
  console.error(e);
});






//=====
 
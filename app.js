var stt = require('./BingStt/BingSpeechWebSocketAPIWrapper.js');
var uuid = require('uuid');
var events = require('events');
var fs = require('fs');

var socket = new stt('<YOUR KEY>',
                        {
                            format:'simple',
                            language:'en-US'
                        });
socket.on('connect',function(){
    console.log('>>> connected');
    //read a file
    if(true){
        var rs = fs.createReadStream('C:\\temp\\whatstheweatherlike.wav');
        socket.startDetection(rs);
    }else{
        fs.readFile('C:\\temp\\whatstheweatherlike.wav', 'binary', function(err,data){
            socket.recognize(data);
        });
    }
});
socket.on('data',function(data){
    console.log('>>> data:' + (data));
});
socket.on('recognized',function(e){
    console.log('==================================');
    console.log(e);
    console.log('==================================');
});
socket.open();

process.stdin.read();




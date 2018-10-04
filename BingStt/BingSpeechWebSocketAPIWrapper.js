var socket = require('ws');
var uuid = require('uuid');
var events = require('events');
var util = require('util');
var subscriptionKey = "";
var guid = '';
var self = null;
var io = null;
var WSHeader = require('./WebSocketHeader.js');
var wsHeader = new WSHeader();
var bingResp = require('./BingResponseMessageParser.js');

var defaultOptions = {
    format:'simple',
    language:'en-US',
    mode:'interactive' // interactive, dictation, conversation
};

var telemetry = {
    Metrics:[],
    ReceivedMessages:{
        turn__start:[],
        speech__startDetected:[],
        speech__hypothesis:[],
        speech__endDetected:[],
        speech__phrase:[],
        turn__end:[]}
    };
function InitializeTelemetry(){
    telemetry = {
        Metrics:[],
        ReceivedMessages:{
            turn__start:[],
            speech__startDetected:[],
            speech__hypothesis:[],
            speech__endDetected:[],
            speech__phrase:[],
            turn__end:[]}
        };
}
function ApiWrapper (apimKey, options) {
    subscriptionKey = apimKey;
    Object.assign(options,defaultOptions);

    events.EventEmitter.call(this);
    self = this;
 };
function sendToSocketServer(item, log){
    try{
        console.log('sending ' + item.length + ' bytes');
        if(log == true)
            console.log('[SendToSocketServer]' + item);
        io.send(item);
    }catch(e){
        console.log('[Exception][Send]' + e);
    }
}

function toArray(buffer){
    return Array.prototype.slice.call(buffer);
}
util.inherits(ApiWrapper, events.EventEmitter);

ApiWrapper.prototype.recognize = function(inputBuffer){
    telemetry.Metrics.push({
        Start:new Date().toISOString(),
        Name:'Microphone',
        End : new Date().toISOString(),
    });
    var header = wsHeader.StartSendingChunk(guid);
    var headerBuffer = new Buffer(header,'binary');
    var dataBuffer = new Buffer(inputBuffer,'binary');

    console.log('reading data from stream...');
    var dataToSendBuffer = Buffer.concat([new Buffer([header.length / 256,header.length % 256]), headerBuffer, dataBuffer]);
    var dataToSend = toArray(dataToSendBuffer);
    sendToSocketServer(dataToSend,false);

}

ApiWrapper.prototype.startDetection = function(inputStream){
    telemetry.Metrics.push({
        Start:new Date().toISOString(),
        Name:'Microphone',
        End : new Date().toISOString(),
    });
    
    inputStream.on('data',function(chunk){
        var header = wsHeader.StartSendingChunk(guid);
        var headerBuffer = new Buffer(header,'binary');
        var headerSizeBuffer = new Buffer([header.length / 256,header.length % 256]);
        var chunkBuffer = new Buffer(chunk);
        var dataToSendBuffer = Buffer.concat([headerSizeBuffer, headerBuffer, chunkBuffer]);
        var dataToSend = toArray(dataToSendBuffer);
        sendToSocketServer(dataToSend,false);        
    });
    inputStream.on('end',function(){
        console.log('end');
    });
}

ApiWrapper.prototype.open = function() {
    guid = uuid.v4().replace('-','');
    guid = guid.replace(/-/g, '');
    var url = 'wss://speech.platform.bing.com/speech/recognition/' + defaultOptions.mode + '/cognitiveservices/v1?format=' + defaultOptions.format + '&language=' + defaultOptions.language + '&Ocp-Apim-Subscription-Key=' + subscriptionKey + '&X-ConnectionId=' + guid;

    io = new socket(url);
    telemetry.Metrics.push({
                End:'',
                Id:guid,
                Name:"Connection",
                Start:new Date().toISOString()});

    io.on('message',function(data){
        //TODO: parse received messages
        console.log('== on message ==');
        var msg = new bingResp();
        msg.parse(data);
        

        switch(msg.item('path')){
            case 'turn.start':
                telemetry.ReceivedMessages.turn__start.push(new Date().toISOString());
            break;
            case 'speech.startDetected':
                telemetry.ReceivedMessages.speech__startDetected.push(new Date().toISOString());
            break;
            case 'speech.hypothesis':   //result
                telemetry.ReceivedMessages.speech__hypothesis.push(new Date().toISOString());
            break;
            case 'speech.endDetected':
                telemetry.ReceivedMessages.speech__endDetected.push(new Date().toISOString());
            break;
            case 'speech.phrase':
                telemetry.ReceivedMessages.speech__phrase.push(new Date().toISOString());
                var body = JSON.parse(msg.item('body'));
                self.emit('recognized',{RecognitionStatus:body.RecognitionStatus,DisplayText:body.DisplayText});
            break;
            case 'turn.end':
                telemetry.ReceivedMessages.turn__end.push(new Date().toISOString());
                //respond with telemetry message
                var ack = JSON.stringify(telemetry).replace('__','.');
                var ackBuffer = toArray(new Buffer(ack, 'binary'));
                sendToSocketServer(ackBuffer);
                InitializeTelemetry();
                console.log('turn.end');
            break;
        }
        
        self.emit('data',data);
    });
            
    io.on('error',function(err){
        console.log(err);
    });

    io.on('disconnect',function(){
        self.emit('disconnect');
    });
    
    io.on('open',function(){
        var headers = wsHeader.SpeechConfig(guid);
        telemetry.Metrics[0].End = new Date().toISOString();
        sendToSocketServer(headers, true);
        self.emit('connect');
    });
};

module.exports = ApiWrapper;
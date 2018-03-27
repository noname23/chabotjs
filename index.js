'use strict';

require('dotenv').config();
const APIAI_TOKEN = process.env.APIAI_TOKEN;
const APIAI_SESSION_ID = process.env.APIAI_SESSION_ID;

const express = require('express');
const app = express();

app.use(express.static(__dirname + '/views')); /*File HTML*/
app.use(express.static(__dirname + '/public')); /*js,css,img*/

const server = app.listen(process.env.PORT || 5000, function () {
    console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const io = require('socket.io')(server);
io.on('connection', function(socket) {
    console.log('a user connected');
});

const apiai = require('apiai')('1cbb4bbf372c4072ae1bf97d311e8b5f');

/*WEB UI*/
app.get('/', function(req,res) {
    res.sendFile('index.html')
});

io.on('connection', function(socket) {
    socket.on('chat message', function (text) {
        console.log('Message: ' + text);

        /*Get a Reply from API.ai*/
        let apiaiReq = apiai.textRequest(text, {
            sessionId: APIAI_SESSION_ID
        });

        apiaiReq.on('response', function (response) {
            let aiText = response.result.fulfillment.speech;
            console.log('Bot reply: ' + aiText);
            socket.emit('Bot reply', aiText); // Send Result To Browser
        });

        apiaiReq.on('Error', function (error) {
            console.log(error);
        });

        apiaiReq.end()

    });
});
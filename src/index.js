const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

// the paths for Express to use
const publicDirectoryPath = path.join(__dirname, "../public");

// define the directory for Express to serve
app.use(express.static(publicDirectoryPath));

// listen for new web socket connections
io.on('connection', (socket) => {
    console.log('New web socket connection.');
    // this emits an event new client only, not all connected clients
    socket.emit('message', 'Welcome!');

    // broadcast an event to every connected client other than the new connection
    socket.broadcast.emit('message', 'A new user has joined!');

    // handle an event from the client
    socket.on('sendMessage', (newMessage, callback) => {
        const filter = new Filter()

        if (filter.isProfane(newMessage)) {
            return callback('Profanity is not allowed!');
        }
        // this emits the event to all connected clients
        io.emit('message', newMessage);
        callback();
    })

    socket.on('sendLocation', ({latitude, longitude}, callback) => {
        // this emits the event to all connected clients
        io.emit('message', `https://google.com/maps?q=${latitude},${longitude}.`);
        callback();
    })

    // send a message to all connected clients when a client disconnects
    socket.on('disconnect', () => {
        io.emit('message', 'A user has left!');
    })
})
  
server.listen(port, () => {
   console.log(`Chat App listening at http://localhost:${port}`);
});
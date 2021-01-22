const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages.js');
const { addUser, getUser, removeUser, getUsersInRoom } = require('./utils/users.js');

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

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room});

        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('Chat App', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage('Chat App', `${user.username} has joined the room!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    })

    // handle an event from the client
    socket.on('sendMessage', (Message, callback) => {
        const user = getUser(socket.id);

        const filter = new Filter()

        if (filter.isProfane(Message)) {
            return callback('Profanity is not allowed!');
        }
        
        io.to(user.room).emit('message', generateMessage(user.username, Message));
        callback();
    })

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })

    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('Chat App', `${user.username} has left the room.`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})
  
server.listen(port, () => {
   console.log(`Chat App listening at http://localhost:${port}`);
});
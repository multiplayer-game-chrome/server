if (process.env.NODE_ENV == "development") {
    require('dotenv').config();
}

const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3211;

app.get('/', function (req, res) {
    res.send('Hello njing!');
});

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(PORT, function () {
    console.log('listening on PORT: ', PORT);
});
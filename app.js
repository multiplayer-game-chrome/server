if (process.env.NODE_ENV == "development") {
    require('dotenv').config();
}
const cors = require('cors');
const app = require('express')();
app.use(cors());

const http = require('http').createServer(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3211;

let board = [
	[ 'z', 'z', 'z' ],
	[ 'z', 'z', 'z' ],
	[ 'z', 'z', 'z' ]
]

let defaultBoard = [
	[ 'z', 'z', 'z' ],
	[ 'z', 'z', 'z' ],
	[ 'z', 'z', 'z' ]
]

function getTotalClients() {
    return io.sockets.clients().server.eio.clientsCount;
}

io.on('connection', function (socket) {
    console.log(`connected`);
    // console.log(io.sockets.clients().server.eio.clientsCount);
    // console.log(getTotalClients());
    // console.log("<<<<<<<<<<<<<<<<<<<<<<");

    let playerId = 0;
    if(getTotalClients() <= 2) {
        playerId = getTotalClients();
    }
    socket.emit('getPlayerId', { playerId })

    socket.on('mark', function (payload) {
        const { x, y, value } = payload
        board[x][y] = value

        // check win logic
        let strDiagLeft = board[0][0] + board[1][1] + board[2][2]
        let strDiagRight = board[0][2] + board[1][1] + board[2][0]
        let winner = ''

        for (let i = 0; i < board.length; i++) {
            let strH = ''
            let strV = ''
            for (let j = 0; j < board.length; j++) {
                strH += board[i][j]
            }

            for (let j = 0; j < board.length; j++) {
                strV += board[j][i]
            }

            if (strH === 'xxx' || strV === 'xxx' || strDiagLeft === 'xxx' ||  strDiagRight === 'xxx') {
                // display player X is win & display player O is lose
                winner = 'X'
                break;
            } else if (strH === 'ooo' || strV === 'ooo' || strDiagLeft === 'ooo' || strDiagRight === 'ooo') {
                // display player O is win & display player X is lose
                console.log(`Player O is the winner!`);
                winner = 'O'
                break;
            }
        }

        payload = {
            board,
            winner
        }

        io.emit('update-board', payload)
    })

    socket.on('reset-board', function () {
        io.emit('update-board', defaultBoard)
    })

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});


http.listen(PORT, function () {
    console.log('listening on PORT: ', PORT);
});
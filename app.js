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

let winner = ''
let playerId = 0;
let isActive = false;

function getTotalClients() {
    return io.sockets.clients().server.eio.clientsCount;
}

io.on('connection', function (socket) {
    console.log(`connected`);
    
    if(getTotalClients() <= 2) {
        playerId = getTotalClients();
        if(playerId == 1) {
            isActive = true;
        } else {
            isActive = false;
        }
    }
    console.log(playerId, isActive);
    socket.emit('setPlayerId', { playerId, isActive })

    socket.on('mark', function (payload) {
        const { x, y, value } = payload
        board[x][y] = value

        // check win logic
        let strDiagLeft = board[0][0] + board[1][1] + board[2][2]
        let strDiagRight = board[0][2] + board[1][1] + board[2][0]

        for (let i = 0; i < board.length; i++) {
            let strH = ''
            let strV = ''
            for (let j = 0; j < board.length; j++) {
                strH += board[i][j]
            }

            for (let j = 0; j < board.length; j++) {
                strV += board[j][i]
            }

            if (strH === 'XXX' || strV === 'XXX') {
                // display player X is win & display player O is lose
                winner = '1'
                break;
            } else if (strH === 'OOO' || strV === 'OOO') {
                // display player O is win & display player X is lose
                winner = '2'
                break;
            }
        }

        console.log(strDiagLeft, 'left', strDiagRight, 'right');
        if (winner === '') {
            if (strDiagLeft === 'XXX' ||  strDiagRight === 'XXX') {
                winner = '1'
            } else if (strDiagLeft === 'OOO' ||  strDiagRight === 'OOO') {
                winner = '2'
            }
        }

        console.log('winner:', winner);
        payload = {
            board,
            winner
        }

        socket.emit('set-is-active', {  isActive: false })
        socket.broadcast.emit('set-is-active', {  isActive: true })
        io.emit('update-board', payload)
    })

    socket.on('get-board-state', function () {
        payload = {
            board,
            winner
        }

        io.emit('update-board', payload)
    })

    socket.on('reset-board', function () {
        board = defaultBoard.slice()
        winner = ''
        payload = {
            board,
            winner
        }
        io.emit('update-board', defaultBoard)
    })

    socket.on('disconnect', function(){
        console.log('user disconnected');
    });
});

http.listen(PORT, function () {
    console.log('listening on PORT: ', PORT);
});
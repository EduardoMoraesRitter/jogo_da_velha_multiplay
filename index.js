const express = require('express')
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)

app.use(express.static(__dirname + '/public'))

let usuarios = []
let sala_aberta = ""

const tic_tac_toe = {
  // ATTRIBUTES
  board: ['', '', '', '', '', '', '', '', ''],
  symbols: {
    options: ['O', 'X'],
    turn_index: 0,
    change() {
      this.turn_index = (this.turn_index === 0 ? 1 : 0)
    }
  },
  container_element: null,
  gameover: false,
  gameover: false,
  winning_sequences: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ],
  check_winning_sequences(symbol, board) {
    for (i in this.winning_sequences) {
      if (board[this.winning_sequences[i][0]] == symbol &&
        board[this.winning_sequences[i][1]] == symbol &&
        board[this.winning_sequences[i][2]] == symbol) {
        console.log('winning sequences INDEX:' + i)
        return i
      }
    }
    return -1
  },
  stylize_winner_sequence(winner_sequence) {
    winner_sequence.forEach((position) => {
      this
        .container_element
        .querySelector(`div:nth-child(${position + 1})`)
        .classList.add('winner')
    })
  }
}

io.on("connection", socket => {

  console.log("conection ID: ", socket.id)

  var usuario = usuarios.filter(x =>
    x.nome == socket.handshake.query['nome'] &&
    x.session == socket.handshake.query['session'])

  if (usuario.length == 0) {
    usuarios.push({
      nome: socket.handshake.query['nome'],
      session: socket.handshake.query['session'],
      socketid: socket.id,
      pontos: 0,
      online: true
    })
  }
  //salvar usuario online
  usuario.online = true

  socket.on('inicia', function (nome) {
    //limpa salas
    //socket.leave(socket.room)
    io.sockets.sockets[socket.id].leave(socket.room)

    if (sala_aberta == "" || io.sockets.adapter.rooms[sala_aberta] == undefined || io.sockets.adapter.rooms[sala_aberta].length == 2) {
      sala_aberta = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      socket.join(sala_aberta)
      socket.room = sala_aberta
      socket.symbols = "O"
      io.sockets.adapter.rooms[socket.room].vez = socket.id
      socket.emit('bora', [])
      console.log("nova sala")
    } else {
      socket.join(sala_aberta)
      socket.room = sala_aberta
      socket.symbols = "X"
      io.sockets.in(socket.room).emit('bora', tic_tac_toe.board)
      console.log("entrou na sala ", tic_tac_toe.board)
    }
    io.sockets.adapter.rooms[socket.room].board = Object.assign([], tic_tac_toe.board)
    io.sockets.adapter.rooms[socket.room].gameover = false
  })

  socket.on('jogada', function (jogada) {

    var allRooms = io.rooms
    var myRooms = socket.rooms

    console.log("jogada do ", socket.symbols, " - ", socket.id)

    if (socket.room &&
      io.sockets.adapter.rooms &&
      io.sockets.adapter.rooms[socket.room] &&
      io.sockets.adapter.rooms[socket.room].vez == socket.id &&
      io.sockets.adapter.rooms[socket.room].gameover == false
    ) {

      var lista_socket = Object.keys(io.sockets.adapter.rooms[socket.room].sockets)
      lista_socket.splice(lista_socket.indexOf(socket.id), 1)
      io.sockets.adapter.rooms[socket.room].vez = lista_socket[0]
      io.sockets.adapter.rooms[socket.room].board[jogada] = socket.symbols
      board = io.sockets.adapter.rooms[socket.room].board
      io.sockets.in(socket.room).emit('jogada', board)

      let winning_sequences_index = tic_tac_toe.check_winning_sequences(socket.symbols, board)

      if (winning_sequences_index >= 0) {
        //this.stylize_winner_sequence(tic_tac_toe.winning_sequences[winning_sequences_index])
        //sequencia do vencedor stylize_winner_sequence
        let winner_sequence = tic_tac_toe.winning_sequences[winning_sequences_index]
        io.sockets.in(socket.room).emit('winner', winner_sequence)
        io.sockets.adapter.rooms[socket.room].gameover = true

        var usuario = usuarios.filter(x =>
          x.nome == socket.handshake.query['nome'] &&
          x.session == socket.handshake.query['session'])

        usuario.pontos = usuario.pontos + 1

      } else if (board.length >= 9) {
        //fim de jogo empatado
      }
    }
  })

  socket.on("disconnect", function () {
    console.log("Disconnect:")//, Object.keys(socket))

    //finaliza jogada por desconecao
    io.sockets.in(socket.room).emit('bora', [])

    //io.emit("update", clients[client.id] + " has left the server.")
    //delete clients[client.id]
  })

})

server.listen(3000)
const express = require('express')
const app = express()
const server = require("http").createServer(app)
const io = require("socket.io")(server)

app.use(express.static(__dirname + '/public'));

function uuidv4() {
  return 'xxxxxx4xxyxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

let sala = ""

const tic_tac_toe = {
  // ATTRIBUTES
  board: ['', '', '', '', '', '', '', '', ''],
  symbols: {
    options: ['O', 'X'],
    turn_index: 0,
    change() {
      this.turn_index = (this.turn_index === 0 ? 1 : 0);
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
        console.log('winning sequences INDEX:' + i);
        return i;
      }
    };
    return -1;
  },
  stylize_winner_sequence(winner_sequence) {
    winner_sequence.forEach((position) => {
      this
        .container_element
        .querySelector(`div:nth-child(${position + 1})`)
        .classList.add('winner');
    });
  }
}

io.on("connection", (socket, nome) => {

  console.log("conection ID: ", socket.id);

  socket.on('inicia', function (nome) {
    //limpa salas
    socket.leave(socket.room)
    io.sockets.sockets[socket.id].leave(socket.room)

    if (sala == "" || io.sockets.adapter.rooms[sala] == undefined || io.sockets.adapter.rooms[sala].length == 2) {
      sala = uuidv4()
      socket.join(sala);
      socket.room = sala
      socket.symbols = "O"
      io.sockets.adapter.rooms[socket.room].vez = socket.id
      socket.emit('bora', [])
      console.log("nova sala")
    } else {
      socket.join(sala);
      socket.room = sala
      socket.symbols = "X"
      io.sockets.in(socket.room).emit('bora', tic_tac_toe.board)
      console.log("entrou na sala ", tic_tac_toe.board)
    }
    io.sockets.adapter.rooms[socket.room].board = Object.assign([], tic_tac_toe.board)
    io.sockets.adapter.rooms[socket.room].gameover = false
  })

  socket.on('jogada', function (jogada) {

    var allRooms = io.rooms;
    var myRooms = socket.rooms;

    console.log("jogada do ",  socket.symbols, " - ", socket.id)

    if (socket.room &&
      io.sockets.adapter.rooms &&
      io.sockets.adapter.rooms[socket.room] &&
      io.sockets.adapter.rooms[socket.room].vez == socket.id &&
      io.sockets.adapter.rooms[socket.room].gameover == false
      ) {

      var lista_socket = Object.keys(io.sockets.adapter.rooms[socket.room].sockets)
      lista_socket.splice(lista_socket.indexOf(socket.id), 1);
      io.sockets.adapter.rooms[socket.room].vez = lista_socket[0]
      io.sockets.adapter.rooms[socket.room].board[jogada] = socket.symbols
      board = io.sockets.adapter.rooms[socket.room].board
      io.sockets.in(socket.room).emit('jogada', board)

      let winning_sequences_index = tic_tac_toe.check_winning_sequences(socket.symbols, board)

      if (winning_sequences_index >= 0) {
        //this.stylize_winner_sequence(tic_tac_toe.winning_sequences[winning_sequences_index]);
        //sequencia do vencedor stylize_winner_sequence
        let winner_sequence = tic_tac_toe.winning_sequences[winning_sequences_index]
        io.sockets.in(socket.room).emit('winner', winner_sequence)
        io.sockets.adapter.rooms[socket.room].gameover = true
      }
    }
  })

  socket.on("disconnect", function () {
    console.log("Disconnect:", Object.keys(socket));

    //finaliza jogada por desconecao
    io.sockets.in(socket.room).emit('bora', [])

    //io.emit("update", clients[client.id] + " has left the server.");
    //delete clients[client.id];
  });

});

server.listen(3000)

  // if (numClients == 0){
  //   socket.join(room);
  //   socket.emit('created', room);
  // } else if (numClients == 1) {
  //   io.sockets.in(room).emit('join', room);
  //   socket.join(room);
  //   socket.emit('joined', room);
  // } else { // max two clients
  //   socket.emit('full', room);
  // }

  // sala = "123"
  // salas.push({
  //   nome: sala,
  //   id: client.id
  // })

  // client.join("sala");
  // client.on("aaa", a => console.log("---", a))

  //client.to(client.id).emit('event', { sala: sala });
  //client.to('minha sala').emit('aaa')

  // client.join(client.id).on("aaa", a => console.log(">>>", a))

  // client.on('join', room => {
  //   client.join(room);
  // });

  // client.on("aaaaaa", function (name) {
  //   console.log("Joined: " + name);
  //   //clients[client.id] = name;
  //   client.emit("update", "You have connected to the server.");
  //   client.broadcast.emit("update", name + " has joined the server.")
  // });

  // client.on("send", function (msg) {
  //   console.log("Message: " + msg);
  //   //client.broadcast.emit("chat", clients[client.id], msg);
  // });

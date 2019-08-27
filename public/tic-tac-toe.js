// TIC TAC TOE
const tic_tac_toe = {

    socket : io('http://localhost:3000')
    
    .on('connect', () => {
        console.log("aqui", tic_tac_toe.socket.disconnected); // false
    })
    .on('bora', board => {
        if(board.length == 0){
            tic_tac_toe.container_element.innerHTML = "Aguarde o outro jogador entrar na sala"
        }else{
            tic_tac_toe.board = board
            tic_tac_toe.draw();
        }        
    })
    .on("jogada", function (board) {
        console.log(">>>>" + board)
        tic_tac_toe.board = board;
        tic_tac_toe.draw();
    })
    .on("winner", function (winner_sequence) {
        tic_tac_toe.stylize_winner_sequence(winner_sequence);
    })
    .on("winner2", function (call) {
        call()
    }),

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
    // winning_sequences: [
    //     [0, 1, 2],
    //     [3, 4, 5],
    //     [6, 7, 8],
    //     [0, 3, 6],
    //     [1, 4, 7],
    //     [2, 5, 8],
    //     [0, 4, 8],
    //     [2, 4, 6]
    // ],

    // FUNCTIONS
    init(container) {
        this.container_element = container;
    },
    start() {
        //this.board.fill('');
        //this.draw();
        //this.gameover = false;
        var nome = document.getElementById("nome").value
        this.socket.emit('inicia', nome)
    },
    // restart() {
    //     if (this.is_game_over() || this.gameover) {
    //         this.start();
    //         console.log('this game has been restarted!')
    //     } else if (confirm('Are you sure you want to restart this game?')) {
    //         this.start();
    //         console.log('this game has been restarted!')
    //     }
    // },
    draw() {
        tic_tac_toe.container_element.innerHTML = tic_tac_toe.board.map((element, index) => `<div onclick="tic_tac_toe.make_play('${index}')"> ${element} </div>`).reduce((content, current) => content + current);
    },
    make_play(position) {
        this.socket.emit('jogada', position)

        // if (this.gameover || this.board[position] !== '') return false;

        // const currentSymbol = this.symbols.options[this.symbols.turn_index];
        // this.board[position] = currentSymbol;
        // this.draw();

        // const winning_sequences_index = this.check_winning_sequences(currentSymbol);
        // if (this.is_game_over()) {
        //     this.game_is_over();
        // }
        // if (winning_sequences_index >= 0) {
        //     this.game_is_over();
        //     this.stylize_winner_sequence(this.winning_sequences[winning_sequences_index]);
        // } else {
        //     this.symbols.change();
        // }
        // return true;
    },
    stylize_winner_sequence(winner_sequence) {
        winner_sequence.forEach((position) => {
            this
                .container_element
                .querySelector(`div:nth-child(${position + 1})`)
                .classList.add('winner');
        });
    },
    // check_winning_sequences(symbol) {

    //     for (i in this.winning_sequences) {
    //         if (this.board[this.winning_sequences[i][0]] == symbol &&
    //             this.board[this.winning_sequences[i][1]] == symbol &&
    //             this.board[this.winning_sequences[i][2]] == symbol) {
    //             console.log('winning sequences INDEX:' + i);
    //             return i;
    //         }
    //     };
    //     return -1;
    // },
    game_is_over() {
        this.gameover = true;
        console.log('GAME OVER');
    },
    is_game_over() {
        return !this.board.includes('');
    },    
};


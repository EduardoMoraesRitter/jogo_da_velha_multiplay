// TIC TAC TOE
window.onload = function () {

    const tic_tac_toe = {
        container_element: null,
        gameover: false,

        // // FUNCTIONS
        init(container) {

            //verifica se ja estava jogando
            var session = sessionStorage['session']

            if (session) {
                document.getElementById("tela").style.display = "block"
                tic_tac_toe.start()
            } else {
                sessionStorage['session'] = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                session = sessionStorage['session']

                document.getElementById("cadastro").style.display = "block";
                //onclick="tic_tac_toe.start()"

                document.getElementById("cadastrar").addEventListener("click", () => {

                    document.getElementById("cadastro").style.display = "none"

                    document.getElementById("tela").style.display = "block"

                    console.log("teste")

                    sessionStorage['nome'] = document.getElementById("nome").value
                    //this.socket.emit('inicia', nome)

                    tic_tac_toe.start()

                });
            }
            //document.querySelector('game')
            //let body = document.getElementsByTagName('body')[0]
            //novo usuario
            this.container_element = container
        },
        start() {



            let socket = io('http://localhost:3000', { transports: ['websocket'], upgrade: false, query: sessionStorage })
                .on('connect', () => {
                    console.log("aqui", tic_tac_toe.socket)

                    document.getElementById("novo_jogo").addEventListener("click", () => {
                        socket.emit('inicia', nome)
                    })

                    socket.emit('inicia', nome)



                })
                .on('disconnect', function () {
                    console.warn('Disconnected');
                })
                .on('connect_error', function () {
                    console.error("Error Connected");
                })
                .on('bora', board => {
                    if (board.length == 0) {
                        tic_tac_toe.container_element.innerHTML = "Aguarde o outro jogador entrar na sala"
                    } else {
                        tic_tac_toe.board = board
                        tic_tac_toe.draw()
                    }
                })
                .on("jogada", function (board) {
                    console.log(">>>>" + board)
                    tic_tac_toe.board = board
                    tic_tac_toe.draw()
                })
                .on("winner", function (winner_sequence) {
                    tic_tac_toe.stylize_winner_sequence(winner_sequence)
                })
                .on("winner2", function (call) {
                    call()
                })

            //this.board.fill('')
            //this.draw()
            //this.gameover = false
            //var nome = document.getElementById("nome").value
            //this.socket.emit('inicia', nome)
        },
        // restart() {
        //     if (this.is_game_over() || this.gameover) {
        //         this.start()
        //         console.log('this game has been restarted!')
        //     } else if (confirm('Are you sure you want to restart this game?')) {
        //         this.start()
        //         console.log('this game has been restarted!')
        //     }
        // },
        draw() {
            tic_tac_toe.container_element.innerHTML = tic_tac_toe.board.map((element, index) => `<div onclick="tic_tac_toe.make_play('${index}')"> ${element} </div>`).reduce((content, current) => content + current)
        },
        make_play(position) {
            this.socket.emit('jogada', position)

            // if (this.gameover || this.board[position] !== '') return false

            // const currentSymbol = this.symbols.options[this.symbols.turn_index]
            // this.board[position] = currentSymbol
            // this.draw()

            // const winning_sequences_index = this.check_winning_sequences(currentSymbol)
            // if (this.is_game_over()) {
            //     this.game_is_over()
            // }
            // if (winning_sequences_index >= 0) {
            //     this.game_is_over()
            //     this.stylize_winner_sequence(this.winning_sequences[winning_sequences_index])
            // } else {
            //     this.symbols.change()
            // }
            // return true
        },
        stylize_winner_sequence(winner_sequence) {
            winner_sequence.forEach((position) => {
                this
                    .container_element
                    .querySelector(`div:nth-child(${position + 1})`)
                    .classList.add('winner')
            })
        },
        // check_winning_sequences(symbol) {

        //     for (i in this.winning_sequences) {
        //         if (this.board[this.winning_sequences[i][0]] == symbol &&
        //             this.board[this.winning_sequences[i][1]] == symbol &&
        //             this.board[this.winning_sequences[i][2]] == symbol) {
        //             console.log('winning sequences INDEX:' + i)
        //             return i
        //         }
        //     }
        //     return -1
        // },
        game_is_over() {
            this.gameover = true
            console.log('GAME OVER')
        },
        is_game_over() {
            return !this.board.includes('')
        },
    }

    tic_tac_toe.init()


}
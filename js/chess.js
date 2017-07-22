var CONSTANTS,
    DEBUG,
    STATE,
    PIECE,
    SQUARE,
    MOVES;

CONSTANTS = {
    COLOURS: {
        BLACK: 'black',
        WHITE: 'white'
    },

    PIECES: {
        ROOK: 'rook',
        KNIGHT: 'knight',
        BISHOP: 'bishop',
        QUEEN: 'queen',
        KING: 'king',
        PAWN: 'pawn'
    },

    STATE_FORMAT: {
        FEN: 'fen',
        PGN: 'pgn'
    }
};

DEBUG = {
    log: function () {
        console.log(arguments);
    }
};

STATE = {
    is_piece_moving: false,
    cur_colour: CONSTANTS.COLOURS.WHITE,

    /**
     * Updates the current colour
     * 
     * @param {any} colour
     * @returns 
     */
    update_current_colour: function (colour) {
        STATE.cur_colour = colour;
        $('.colour_to_move').text(colour);
    },

    captured: {
        white: [],
        black: []
    },

    /**
     * Add piece to list of captured pieces
     * 
     * @param {any} colour
     * @param {any} piece_type
     * @returns 
     */
    add_captured_piece: function (colour, piece_type) {
        var container = '.pieces_lost .' + colour;

        if (STATE.captured[colour].length === 0) {
            $(container).find('.lbl_no_pieces_lost').hide();
        }

        STATE.captured[colour].push(piece_type);
        $(container).append(piece_factory(piece_type, colour));
    },

    /**
     * Clear states to prepare to reset board
     * 
     * @returns 
     */
    clear_states: function () {
        STATE.update_current_colour(CONSTANTS.COLOURS.WHITE);
        STATE.captured.white = [];
        STATE.captured.black = [];
        STATE.history = [];
    },

    history_mode: CONSTANTS.STATE_FORMAT.FEN,
    history: [],
    
    /**
     * Add the state of board to history
     * 
     * @returns 
     */
    add_to_history: function () {
        var board_in_fen;

        if (STATE.history_mode === CONSTANTS.STATE_FORMAT.FEN) {
            board_in_fen = MOVES.board_to_fen();
            STATE.history.push(board_in_fen);
        }
    },

    /**
     * Undo last move
     * 
     * @returns 
     */
    undo: function () {
        var board_in_fen;

        if (STATE.history_mode === CONSTANTS.STATE_FORMAT.FEN) {
            STATE.history.splice(STATE.history.length - 1);
            board_in_fen = STATE.history[STATE.history.length - 1]

            if (!noe(board_in_fen)) {
                MOVES.fen_to_board(board_in_fen);
            } else {
                draw_board();
                init_pieces();
            }

            STATE.show_undo_button();
        }
    },

    /**
     * Shows or hides the undo button as appropriate
     * 
     * @returns 
     */
    show_undo_button: function () {
        if (STATE.history.length === 0) {
            $('.undo').hide();
        } else {
            $('.undo').show();
        }
    }
};

PIECE = {
    /**
     * Returns the type of the piece for a given piece
     * 
     * @param {any} piece
     * @returns 
     */
    get_piece_type: function (piece) {
        return $(piece).data('piece_type');
    },

    /**
     * Returns the position of the piece for a given piece
     * 
     * @param {any} piece
     * @returns [row_index, col_index]
     */
    get_piece_position: function (piece) {
        return [$(piece).data('row_index'), $(piece).data('col_index')];
    },

    /**
     * Returns the colour of the piece for a given piece
     * 
     * @param {any} piece
     * @returns 
     */
    get_piece_colour: function (piece) {
        return $(piece).data('colour');
    },

    /**
     * Returns if the given piece has moved at least once or not
     * 
     * @param {any} piece
     * @returns 
     */
    has_moved: function (piece) {
        return !!$(piece).data('has_moved');
    }
};

SQUARE = {
    /**
     * Returns the square at the target position
     * 
     * @param {any} row_index 
     * @param {any} col_index 
     * @returns 
     */
    get_square_at: function (row_index, col_index) {
        return $('[data-row_index="' + row_index + '"][data-col_index="' + col_index + '"]');
    },

    /**
     * Returns the position of the square for a given square
     * 
     * @param {any} square
     * @returns [row_index, col_index]
     */
    get_square_position: function (square) {
        return [$(square).data('row_index'), $(square).data('col_index')];
    },

    /**
     * Returns the piece at the target position
     * If a piece does not exist, it returns undefined
     * 
     * @param {any} row_index 
     * @param {any} col_index 
     * @returns 
     */
    get_piece_at: function (row_index, col_index) {
        var cur_piece = $(SQUARE.get_square_at(row_index, col_index)).find('.chess_piece');
        return cur_piece;
    },

    /**
     * Checks if there is a piece at the given co-ordinate
     * Returns undefined if no piece is found
     * Returns the colour the piece if a piece is found
     * 
     * @param {any} row_index 
     * @param {any} col_index 
     */
    has_piece_at: function (row_index, col_index) {
        var cur_piece = SQUARE.get_piece_at(row_index, col_index);
        
        if (noe(cur_piece)) {
            return false;
        }

        return PIECE.get_piece_colour(cur_piece);
    },

    /**
     * This function checks if an opponent piece exists in the target square
     * If it does, it removes the piece
     * 
     * @param {any} row_index 
     * @param {any} col_index 
     */
    kill_piece_at: function (row_index, col_index) {
        var existing_piece_colour = SQUARE.has_piece_at(row_index, col_index),
            existing_piece = SQUARE.get_piece_at(row_index, col_index);

        // If piece exists and is of opposite colour
        if (!noe(existing_piece_colour) && existing_piece_colour !== STATE.cur_colour) {
            STATE.add_captured_piece(existing_piece_colour, PIECE.get_piece_type(existing_piece));
            $(SQUARE.get_square_at(row_index, col_index)).find('.chess_piece').remove();
        }
    },

    /**
     * Check if the target square contains an opponent
     * 
     * @param {any} row_index
     * @param {any} col_index
     */
    contains_opponent_at: function (row_index, col_index) {
        var colour_at_position = PIECE.get_piece_colour(SQUARE.get_piece_at(row_index, col_index));
        return !noe(colour_at_position) && (colour_at_position !== STATE.cur_colour);
    }
};

/**
 * Create a piece of any type
 * 
 * @param {any} piece_type 
 * @param {any} colour 
 * @returns String
 */
function piece_factory(piece_type, colour) {
    return $(
                [
                    '<span class="chess_piece ', 
                        colour, '_', piece_type, '" ',
                        'data-piece_type="' + piece_type + '" ',
                        'data-colour="' + colour + '">',
                    '</span>'
                ].join('')
            );
}

function init_game() {
    (function init_listeners() {
        // New Game
        $('.new_game').on('click', function () {
            init_board();
        });

        $('.undo').on('click', function () {
            STATE.undo();
        });
    })();
    
    init_board();
}

/**
 * Draw Board
 * Draw Pieces
 */
function init_board() {
    draw_board();
    init_pieces();
    STATE.clear_states();

    $('.pieces_lost .chess_piece').remove();
    $('.lbl_no_pieces_lost').show();

    STATE.show_undo_button();
}

/**
 * Clears the board
 * Draw Board
 */
function draw_board() {
    var row_index = 0,
        col_index = 0,
        row,
        cur_colour = CONSTANTS.COLOURS.BLACK;

    $('#chess_board').html('');

    for (row_index = 0; row_index < 8; row_index++) {
        row = '';
        for (col_index = 0; col_index < 8; col_index++) {
            cur_colour = invert_colour(cur_colour);
            row += [
                    '<div class="chess_square ' + cur_colour + '"',
                        ' data-row_index="' + row_index + '" data-col_index="' + col_index + '">', 
                    '</div>'
                ].join('');
        }

        row = ['<div class="chess_row">', row, '</div>'].join('');
        $('#chess_board').append(row);
        cur_colour = invert_colour(cur_colour);
    }
}

MOVES = {
    /**
     * Translates fen format to an actual board position
     * 
     * @param {any} fen 
     * @returns
     */
    fen_to_board: function (fen) {
        var moves,
            square,
            colour,
            piece_type,
            piece,
            expanded_move_row,
            j, t, k;

        draw_board();

        fen = fen.split(' ');
        moves = fen[0].split('/');

        moves.forEach(function (move_row, i) {
            move_row = move_row.split('');
            expanded_move_row = [];

            // Expand number to individual spaces
            move_row.forEach(function (j) {
                t = parseInt(j);
                if (isNaN(t)) {
                    expanded_move_row.push(j)
                } else {
                    for (k = 0; k < t; k++) {
                        expanded_move_row.push(undefined);
                    }
                }
            });

            for (j = 0; j < expanded_move_row.length; j++) {
                square = SQUARE.get_square_at(i, j);
                piece_code = expanded_move_row[j];

                switch(piece_code) {
                    case 'P':
                        piece_type = CONSTANTS.PIECES.PAWN;
                        piece_colour = CONSTANTS.COLOURS.WHITE;
                        break;
                    
                    case 'p':
                        piece_type = CONSTANTS.PIECES.PAWN;
                        piece_colour = CONSTANTS.COLOURS.BLACK;
                        break;
                    
                    case 'R':
                        piece_type = CONSTANTS.PIECES.ROOK;
                        piece_colour = CONSTANTS.COLOURS.WHITE;
                        break;
                    
                    case 'r':
                        piece_type = CONSTANTS.PIECES.ROOK;
                        piece_colour = CONSTANTS.COLOURS.BLACK;
                        break;
                    
                    case 'N':
                        piece_type = CONSTANTS.PIECES.KNIGHT;
                        piece_colour = CONSTANTS.COLOURS.WHITE;
                        break;
                    
                    case 'n':
                        piece_type = CONSTANTS.PIECES.KNIGHT;
                        piece_colour = CONSTANTS.COLOURS.BLACK;
                        break;
                    
                    case 'B':
                        piece_type = CONSTANTS.PIECES.BISHOP;
                        piece_colour = CONSTANTS.COLOURS.WHITE;
                        break;
                    
                    case 'b':
                        piece_type = CONSTANTS.PIECES.BISHOP;
                        piece_colour = CONSTANTS.COLOURS.BLACK;
                        break;
                    
                    case 'Q':
                        piece_type = CONSTANTS.PIECES.QUEEN;
                        piece_colour = CONSTANTS.COLOURS.WHITE;
                        break;
                    
                    case 'q':
                        piece_type = CONSTANTS.PIECES.QUEEN;
                        piece_colour = CONSTANTS.COLOURS.BLACK;
                        break;
                    
                    case 'K':
                        piece_type = CONSTANTS.PIECES.KING;
                        piece_colour = CONSTANTS.COLOURS.WHITE;
                        break;
                    
                    case 'k':
                        piece_type = CONSTANTS.PIECES.KING;
                        piece_colour = CONSTANTS.COLOURS.BLACK;
                        break;
                    
                    default:
                        piece_type = undefined;
                }

                if (!noe(piece_type)) {
                    piece = piece_factory(piece_type, piece_colour);
                    $(square).append(piece);
                }
            }
        });
    },

    /**
     * Translates pieces and board position into fen format
     * 
     * Refer:
     * https://en.wikipedia.org/wiki/Forsyth–Edwards_Notation
     *  
     * @returns fen format
     */
    board_to_fen: function () {
        var fen_format = [],
            row,
            piece,
            piece_type,
            piece_colour,
            fen_char,
            space_ctr,
            i, j;
        
        for (i = 0; i < 8; i++) {
            row = [];
            space_ctr = 0;

            for (j = 0; j < 8; j++) {
                piece = SQUARE.get_piece_at(i, j);
                piece_type = PIECE.get_piece_type(piece);
                piece_colour = PIECE.get_piece_colour(piece);

                switch (piece_type) {
                    case CONSTANTS.PIECES.PAWN:
                        fen_char = piece_colour === CONSTANTS.COLOURS.WHITE ? 'P' : 'p';
                        break;

                    case CONSTANTS.PIECES.ROOK:
                        fen_char = piece_colour === CONSTANTS.COLOURS.WHITE ? 'R' : 'r';
                        break;

                    case CONSTANTS.PIECES.KNIGHT:
                        fen_char = piece_colour === CONSTANTS.COLOURS.WHITE ? 'N' : 'n';
                        break;

                    case CONSTANTS.PIECES.BISHOP:
                        fen_char = piece_colour === CONSTANTS.COLOURS.WHITE ? 'B' : 'b';
                        break;

                    case CONSTANTS.PIECES.QUEEN:
                        fen_char = piece_colour === CONSTANTS.COLOURS.WHITE ? 'Q' : 'q';
                        break;

                    case CONSTANTS.PIECES.KING:
                        fen_char = piece_colour === CONSTANTS.COLOURS.WHITE ? 'K' : 'k';
                        break;
                    
                    default:
                        fen_char = undefined;
                        space_ctr += 1;
                }

                if (!noe(fen_char)) {
                    if (space_ctr !== 0) {
                        row.push(space_ctr);
                        space_ctr = 0;
                    }
                    
                    row.push(fen_char);
                } else if (j === 7) {
                    row.push(space_ctr);
                    space_ctr = 0;
                }
            }

            fen_format.push(row.join(''));
        }

        fen_format = fen_format.join('/');

        return fen_format;
    }
};

/**
 * Utility function that checks if colour is black or white
 * and returns inverted colour
 * @param {any} cur_colour 
 * @returns inverted colour constant
 */
function invert_colour(cur_colour) {
    return cur_colour === CONSTANTS.COLOURS.BLACK ? CONSTANTS.COLOURS.WHITE : CONSTANTS.COLOURS.BLACK;
}

/**
 * Initialises all pieces to starting positions
 * 
 */
function init_pieces() {
    var row_index,
        col_index,
        pawn,
        
        white_king_index = [7, 4],
        black_king_index = [0, 4],
        
        white_queen_index = [7, 3],
        black_queen_index = [0, 3],

        white_bishop_1_index = [7, 2],
        black_bishop_1_index = [0, 2],
        white_bishop_2_index = [7, 5],
        black_bishop_2_index = [0, 5],

        white_knight_1_index = [7, 1],
        black_knight_1_index = [0, 1],
        white_knight_2_index = [7, 6],
        black_knight_2_index = [0, 6],

        white_rook_1_index = [7, 0],
        black_rook_1_index = [0, 0],
        white_rook_2_index = [7, 7],
        black_rook_2_index = [0, 7],

        piece;

    // Init black pawns
    row_index = 1;
    pawn = piece_factory(CONSTANTS.PIECES.PAWN, CONSTANTS.COLOURS.BLACK);
    for (col_index = 0; col_index < 8; col_index++) {
        piece = $(pawn).clone();
        $('[data-row_index="' + row_index + '"][data-col_index="' + col_index + '"]').append(piece);
        make_piece_draggable(piece);
    }

    // Init white pawns
    row_index = 6;
    pawn = piece_factory(CONSTANTS.PIECES.PAWN, CONSTANTS.COLOURS.WHITE);
    for (col_index = 0; col_index < 8; col_index++) {
        piece = $(pawn).clone();
        $('[data-row_index="' + row_index + '"][data-col_index="' + col_index + '"]').append(piece);
        make_piece_draggable(piece);
    }

    // Init Kings
    piece = piece_factory(CONSTANTS.PIECES.KING, CONSTANTS.COLOURS.WHITE);
    $(SQUARE.get_square_at(white_king_index[0], white_king_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.KING, CONSTANTS.COLOURS.BLACK);
    $(SQUARE.get_square_at(black_king_index[0], black_king_index[1])).append(piece);
    make_piece_draggable(piece);

    // Init Queens
    piece = piece_factory(CONSTANTS.PIECES.QUEEN, CONSTANTS.COLOURS.WHITE);
    $(SQUARE.get_square_at(white_queen_index[0], white_queen_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.QUEEN, CONSTANTS.COLOURS.BLACK);
    $(SQUARE.get_square_at(black_queen_index[0], black_queen_index[1])).append(piece);
    make_piece_draggable(piece);

    // Init Bishops
    piece = piece_factory(CONSTANTS.PIECES.BISHOP, CONSTANTS.COLOURS.WHITE);
    $(SQUARE.get_square_at(white_bishop_1_index[0], white_bishop_1_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.BISHOP, CONSTANTS.COLOURS.BLACK);
    $(SQUARE.get_square_at(black_bishop_1_index[0], black_bishop_1_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.BISHOP, CONSTANTS.COLOURS.WHITE);
    $(SQUARE.get_square_at(white_bishop_2_index[0], white_bishop_2_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.BISHOP, CONSTANTS.COLOURS.BLACK);
    $(SQUARE.get_square_at(black_bishop_2_index[0], black_bishop_2_index[1])).append(piece);
    make_piece_draggable(piece);

    // Init Knights
    piece = piece_factory(CONSTANTS.PIECES.KNIGHT, CONSTANTS.COLOURS.WHITE);
    $(SQUARE.get_square_at(white_knight_1_index[0], white_knight_1_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.KNIGHT, CONSTANTS.COLOURS.BLACK);
    $(SQUARE.get_square_at(black_knight_1_index[0], black_knight_1_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.KNIGHT, CONSTANTS.COLOURS.WHITE);
    $(SQUARE.get_square_at(white_knight_2_index[0], white_knight_2_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.KNIGHT, CONSTANTS.COLOURS.BLACK);
    $(SQUARE.get_square_at(black_knight_2_index[0], black_knight_2_index[1])).append(piece);
    make_piece_draggable(piece);

    // Init Rooks
    piece = piece_factory(CONSTANTS.PIECES.ROOK, CONSTANTS.COLOURS.WHITE);
    $(SQUARE.get_square_at(white_rook_1_index[0], white_rook_1_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.ROOK, CONSTANTS.COLOURS.BLACK);
    $(SQUARE.get_square_at(black_rook_1_index[0], black_rook_1_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.ROOK, CONSTANTS.COLOURS.WHITE);
    $(SQUARE.get_square_at(white_rook_2_index[0], white_rook_2_index[1])).append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.ROOK, CONSTANTS.COLOURS.BLACK);
    $(SQUARE.get_square_at(black_rook_2_index[0], black_rook_2_index[1])).append(piece);
    make_piece_draggable(piece);
}

/**
 * Make the current piece draggable
 * 
 * @param {any} piece 
 */
function make_piece_draggable(piece) {
    $(piece).on('mouseover', function () {
        if (STATE.is_piece_moving) { return false; }

        var piece_type = PIECE.get_piece_type(piece),
            row_index = parseInt($(piece).closest('.chess_square').data('row_index')),
            col_index = parseInt($(piece).closest('.chess_square').data('col_index'));
        
        switch(piece_type) {
            case CONSTANTS.PIECES.PAWN:
                make_pawn_draggable(piece, row_index, col_index);
                break;
            
            case CONSTANTS.PIECES.KNIGHT:
                make_knight_draggable(piece, row_index, col_index);
                break;
            
            case CONSTANTS.PIECES.ROOK:
                make_rook_draggable(piece, row_index, col_index);
                break;
            
            case CONSTANTS.PIECES.BISHOP:
                make_bishop_draggable(piece, row_index, col_index);
                break;
            
            case CONSTANTS.PIECES.QUEEN:
                make_queen_draggable(piece, row_index, col_index);
                break;
            
            case CONSTANTS.PIECES.KING:
                make_king_draggable(piece, row_index, col_index);
                break;
        }
    });

    $(piece).on('mouseout', function () {
        if (STATE.is_piece_moving) { return false; }

        remove_all_droppable();
    });

    $(piece).on('mousedown', function () {
        STATE.is_piece_moving = true;
    });

    $(piece).on('mouseup mouseleave', function () {
        STATE.is_piece_moving = false;
    });

    /**
     * Makes the current pawn draggable
     * 
     * @param {any} piece 
     * @param {any} row_index 
     * @param {any} col_index 
     */
    function make_pawn_draggable(piece, row_index, col_index) {
        var has_moved = PIECE.has_moved(piece),
            colour = PIECE.get_piece_colour(piece),
            new_row_index = colour === CONSTANTS.COLOURS.WHITE ? row_index - 1 : row_index + 1,
            allowed_positions = [];
        
        if (!SQUARE.has_piece_at(new_row_index, col_index)) {
            allowed_positions.push([new_row_index, col_index]);
        }

        if (SQUARE.contains_opponent_at(new_row_index, col_index + 1)) {
            allowed_positions.push([new_row_index, col_index + 1]);
        }

        if (SQUARE.contains_opponent_at(new_row_index, col_index - 1)) {
            allowed_positions.push([new_row_index, col_index - 1]);
        }


        if (!has_moved) {
            new_row_index = colour === CONSTANTS.COLOURS.WHITE ? row_index - 2 : row_index + 2,
            allowed_positions.push([new_row_index, col_index]);
        }

        set_allowed_positions(allowed_positions, piece);
    }

    /**
     * Make Knight draggable
     * 
     * @param {any} piece 
     * @param {any} row_index 
     * @param {any} col_index 
     */
    function make_knight_draggable(piece, row_index, col_index) {
        var allowed_positions = [
            [row_index - 1, col_index - 2],
            [row_index - 2, col_index - 1],
            [row_index + 1, col_index - 2],
            [row_index + 2, col_index - 1],
            [row_index - 1, col_index + 2],
            [row_index - 2, col_index + 1],
            [row_index + 1, col_index + 2],
            [row_index + 2, col_index + 1]
        ];

        set_allowed_positions(allowed_positions, piece);
    }

    /**
     * Make Rook draggable
     * 
     * @param {any} piece 
     * @param {any} row_index 
     * @param {any} col_index 
     */
    function make_rook_draggable(piece, row_index, col_index) {
        var i,
            allowed_positions = [];

        allowed_positions = get_vertical_allowed_positions(piece, row_index, col_index);

        set_allowed_positions(allowed_positions, piece);
    }

    /**
     * Make Bishop draggable
     * 
     * @param {any} piece 
     * @param {any} row_index 
     * @param {any} col_index 
     */
    function make_bishop_draggable(piece, row_index, col_index) {
        var i, j,
            allowed_positions = [];

        allowed_positions = get_diagonal_allowed_positions(piece, row_index, col_index);

        set_allowed_positions(allowed_positions, piece);
    }
    
    /**
     * Make Queen draggable
     * 
     * @param {any} piece 
     * @param {any} row_index 
     * @param {any} col_index 
     */
    function make_queen_draggable(piece, row_index, col_index) {
        var i, j,
            allowed_positions = [],
            cur_colour = PIECE.get_piece_colour(piece),
            cur_piece_position = [],
            piece_at_position,
            can_go = {
                up: true,
                down: true,
                left: true,
                right: true
            };
        
        cur_piece_position = PIECE.get_piece_position(piece);

        // Diagonal
        allowed_positions = get_diagonal_allowed_positions(piece, row_index, col_index);
        
        // Vertical
        allowed_positions = allowed_positions.concat(
                                get_vertical_allowed_positions(piece, row_index, col_index)
                            );


        set_allowed_positions(allowed_positions, piece);
    }

    /**
     * Make King draggable
     * 
     * @param {any} piece 
     * @param {any} row_index 
     * @param {any} col_index 
     */
    function make_king_draggable(piece, row_index, col_index) {
        var allowed_positions = [
            [row_index - 1, col_index - 1],
            [row_index - 1, col_index],
            [row_index - 1, col_index + 1],
            [row_index, col_index - 1],
            [row_index, col_index + 1],
            [row_index + 1, col_index - 1],
            [row_index + 1, col_index],
            [row_index + 1, col_index + 1],
        ];

        set_allowed_positions(allowed_positions, piece);
    }

    /**
     * Take an array of allowed positions and make the piece
     * draggable and droppable
     * @param {any} allowed_positions 
     * @param {any} piece 
     */
    function set_allowed_positions(allowed_positions, piece) {
        var target_position,
            existing_chess_piece;
        
        /**
         * Check if the current piece is the same colour
         * If it is the same, we do not set any allowed positions
         */
        if (PIECE.get_piece_colour(piece) !== STATE.cur_colour) {
            return false;
        }

        allowed_positions.forEach(function (allowed_position) {
            target_position = '[data-row_index="' + allowed_position[0] + '"][data-col_index="' + allowed_position[1] + '"]';

            /* 
                Check if the allowed position has a piece of the same colour 
            */
            existing_chess_piece = $(target_position).find('.chess_piece');
            if (!noe(existing_chess_piece) && PIECE.get_piece_colour(existing_chess_piece) === STATE.cur_colour) {
                return true;
            }

            // Set allowed position
            $(target_position).
                droppable({
                    activeClass: 'allowed_position',
                    drop: function (event, ui) {
                        // ondrop on drop

                        var new_piece = clone_piece($(ui.draggable)),
                            square = $(this),
                            dropped_chess_piece = $(ui.draggable),
                            square_position = SQUARE.get_square_position(square);

                        // Kill the piece at position if appropriate
                        SQUARE.kill_piece_at(square_position[0], square_position[1]);

                        // Remove the piece that we just moved/dropped
                        // Add the cloned piece and appropriate bindings
                        $(dropped_chess_piece).remove();
                        $(square).append(new_piece);
                        $(new_piece).data('has_moved', true);
                        make_piece_draggable($(new_piece));

                        STATE.update_current_colour(STATE.cur_colour === CONSTANTS.COLOURS.WHITE ? CONSTANTS.COLOURS.BLACK : CONSTANTS.COLOURS.WHITE);

                        STATE.add_to_history();
                        STATE.show_undo_button();
                    }
                });
        });

        $(piece).draggable({
            revert: 'invalid'
        });
    }
}

/**
 * Take in a piece and return a clone
 * 
 * @param {any} piece 
 * @returns 
 */
function clone_piece(piece) {
    var piece_type = PIECE.get_piece_type(piece),
        colour = PIECE.get_piece_colour(piece);

    return piece_factory(piece_type, colour);
}

/**
 * Removes droppable characteristic of all squares
 * 
 */
function remove_all_droppable() {
    var row_index,
        col_index;

    for (row_index = 0; row_index < 8; row_index++) {
        for (col_index = 0; col_index < 8; col_index++) {
            try {
                $('[data-row_index="' + row_index + '"][data-col_index="' + col_index + '"]').
                    removeClass('allowed_position');

                $('[data-row_index="' + row_index + '"][data-col_index="' + col_index + '"]').
                    droppable('destroy');
            } catch(e) {
                // Do nothing
            }
            
        }
    }
}

/**
 * Gets a set of allowed positions for vertical movements
 * This can be used by Rooks and vertical movements for Queens
 * 
 * @param {any} piece 
 * @param {any} row_index 
 * @param {any} col_index 
 * @returns 
 */
function get_vertical_allowed_positions(piece, row_index, col_index) {
    var i,
        allowed_positions = [],
        colour_at_position,
        can_go = {
            up: true,
            down: true,
            left: true,
            right: true
        },
        colour_of_cur_piece = PIECE.get_piece_colour(piece);
    
    for (i = 1; i < 8; i++) {
        if (can_go.up) {
            colour_at_position = SQUARE.has_piece_at(row_index - i, col_index);

            // If the piece at the position is same colour as current piece
            if (colour_at_position === colour_of_cur_piece) {
                can_go.up = false;
            } else {
                // If the piece at the position is opposite colour as current piece
                if (!noe(colour_at_position)) {
                    can_go.up = false;
                }

                allowed_positions.push([row_index - i, col_index]);
            }
        }

        if (can_go.down) {
            colour_at_position = SQUARE.has_piece_at(row_index + i, col_index);
            
            // If the piece at the position is same colour as current piece
            if (colour_at_position === colour_of_cur_piece) {
                can_go.down = false;
            } else {
                // If the piece at the position is opposite colour as current piece
                if (!noe(colour_at_position)) {
                    can_go.down = false;
                }

                allowed_positions.push([row_index + i, col_index]);                
            }

        }

        if (can_go.left) {
            colour_at_position = SQUARE.has_piece_at(row_index, col_index - i);
            
            // If the piece at the position is same colour as current piece
            if (colour_at_position === colour_of_cur_piece) {
                can_go.left = false;
            } else {
                // If the piece at the position is opposite colour as current piece
                if (!noe(colour_at_position)) {
                    can_go.left = false;
                }

                allowed_positions.push([row_index, col_index - i]);
            }
        }

        if (can_go.right) {
            colour_at_position = SQUARE.has_piece_at(row_index, col_index + i);
            
            // If the piece at the position is same colour as current piece
            if (colour_at_position === colour_of_cur_piece) {
                can_go.right = false;
            } else {
                // If the piece at the position is opposite colour as current piece
                if (!noe(colour_at_position)) {
                    can_go.right = false;
                }

                allowed_positions.push([row_index, col_index + i]);
            }
        }

    }

    return allowed_positions;
}

/**
 * Gets a set of allowed positions for diagonal movements
 * This can be used by Bishops and diagonal movements for Queens
 * 
 * @param {any} piece 
 * @param {any} row_index 
 * @param {any} col_index 
 * @returns 
 */
function get_diagonal_allowed_positions(piece, row_index, col_index) {
    var i,
        allowed_positions = [],
        colour_at_position,
        can_go = {
            up: true,
            down: true,
            left: true,
            right: true
        },
        colour_of_cur_piece = PIECE.get_piece_colour(piece);;

    for (i = 1; i < 8; i++) {
        if (can_go.up) {
            colour_at_position = SQUARE.has_piece_at(row_index - i, col_index - i);

            // If the piece at the position is same colour as current piece
            if (colour_at_position === colour_of_cur_piece) {
                can_go.up = false;
            } else {
                // If the piece at the position is opposite colour as current piece
                if (!noe(colour_at_position)) {
                    can_go.up = false;
                }

                allowed_positions.push([row_index - i, col_index - i]);
            }
        }

        if (can_go.down) {
            colour_at_position = SQUARE.has_piece_at(row_index + i, col_index + i);
            
            // If the piece at the position is same colour as current piece
            if (colour_at_position === colour_of_cur_piece) {
                can_go.down = false;
            } else {
                // If the piece at the position is opposite colour as current piece
                if (!noe(colour_at_position)) {
                    can_go.down = false;
                }

                allowed_positions.push([row_index + i, col_index + i]);
            }
        }

        if (can_go.left) {
            colour_at_position = SQUARE.has_piece_at(row_index - i, col_index + i);
            
            // If the piece at the position is same colour as current piece
            if (colour_at_position === colour_of_cur_piece) {
                can_go.left = false;
            } else {
                // If the piece at the position is opposite colour as current piece
                if (!noe(colour_at_position)) {
                    can_go.left = false;
                }

                allowed_positions.push([row_index - i, col_index + i]);
            }
        }

        if (can_go.right) {
            colour_at_position = SQUARE.has_piece_at(row_index + i, col_index - i);
            
            // If the piece at the position is same colour as current piece
            if (colour_at_position === colour_of_cur_piece) {
                can_go.right = false;
            } else {
                // If the piece at the position is opposite colour as current piece
                if (!noe(colour_at_position)) {
                    can_go.right = false;
                }

                allowed_positions.push([row_index + i, col_index - i]);
            }
        }
    }

    return allowed_positions;
}

/**
 * Checks if the king of the colour is under check
 * 
 * @param {any} colour 
 * @returns 
 */
function is_king_under_check(colour) {
    var king_piece = SQUARE.get_piece_at(row_index, col_index),
        king_square = $('#chess_board').
                        find('.chess_piece[data-piece_type="king"][data-colour="' + colour + '"]').
                        closest('.chess_square'),
        row_index = parseInt($(king_square).data('row_index')),
        col_index = parseInt($(king_square).data('col_index')),
        vertical_positions,
        diagonal_positions,
        knight_squares,
        king_squares,
        piece = SQUARE.get_piece_at(row_index, col_index),
        piece_type,
        colour_at_position,
        under_check = false;
    
    vertical_positions = get_vertical_allowed_positions(piece, row_index, col_index);
    diagonal_positions = get_diagonal_allowed_positions(piece, row_index, col_index);

    // Vertical threats - Rook and Queen
    vertical_positions.forEach(function (v_pos) {
        piece = SQUARE.get_piece_at(v_pos[0], v_pos[1]);
        piece_type = PIECE.get_piece_type(piece);

        if (colour !== PIECE.get_piece_colour(piece) && (piece_type === CONSTANTS.PIECES.ROOK || piece_type === CONSTANTS.PIECES.QUEEN)) {
            under_check = true;
        }
    });

    // Diagonal threats - Bishop and Queen
    diagonal_positions.forEach(function (d_pos) {
        piece = SQUARE.get_piece_at(d_pos[0], d_pos[1]);
        piece_type = PIECE.get_piece_type(piece);

        if (colour !== PIECE.get_piece_colour(piece) && (piece_type === CONSTANTS.PIECES.BISHOP || piece_type === CONSTANTS.PIECES.QUEEN)) {
            under_check = true;
        }
    });

    // Pawn threats
    if (colour === CONSTANTS.COLOURS.WHITE) {
        piece = SQUARE.get_piece_at(row_index - 1, col_index - 1);
        if (PIECE.get_piece_type(piece) === CONSTANTS.PIECES.PAWN && colour !== PIECE.get_piece_colour(piece)) {
            under_check = true;
        }

        piece = SQUARE.get_piece_at(row_index - 1, col_index + 1);
        if (PIECE.get_piece_type(piece) === CONSTANTS.PIECES.PAWN && colour !== PIECE.get_piece_colour(piece)) {
            under_check = true;
        }
    } else if (colour === CONSTANTS.COLOURS.BLACK) {
        piece = SQUARE.get_piece_at(row_index + 1, col_index - 1);
        if (PIECE.get_piece_type(piece) === CONSTANTS.PIECES.PAWN && colour !== PIECE.get_piece_colour(piece)) {
            under_check = true;
        }

        piece = SQUARE.get_piece_at(row_index + 1, col_index + 1);
        if (PIECE.get_piece_type(piece) === CONSTANTS.PIECES.PAWN && colour !== PIECE.get_piece_colour(piece)) {
            under_check = true;
        }
    }

    // Knight threats
    knight_squares = [
        [row_index - 2, col_index - 1], [row_index - 2, col_index + 1],
        [row_index - 1, col_index - 2], [row_index - 1, col_index + 2],
        [row_index + 2, col_index - 1], [row_index + 2, col_index + 1],
        [row_index + 1, col_index - 2], [row_index + 1, col_index + 2]
    ];

    knight_squares.forEach(function (knight_square) {
        piece = SQUARE.get_piece_at(knight_square[0], knight_square[1]);
        piece_type = PIECE.get_piece_type(piece);
        colour_at_position = PIECE.get_piece_colour(piece);

        if (piece_type === CONSTANTS.PIECES.KNIGHT && colour_at_position !== colour) {
            under_check = true;
        }
    });

    // King threats
    king_squares = [
        [row_index - 1, col_index - 1], [row_index - 1, col_index], [row_index - 1, col_index + 1],
        [row_index, col_index - 1], [row_index, col_index + 1],
        [row_index + 1, col_index - 1], [row_index + 1, col_index], [row_index + 1, col_index + 1],
    ];

    king_squares.forEach(function (king_square) {
        piece = SQUARE.get_piece_at(king_square[0], king_square[1]);
        piece_type = PIECE.get_piece_type(piece);
        colour_at_position = PIECE.get_piece_colour(piece);

        if (piece_type === CONSTANTS.PIECES.KING && colour_at_position !== colour) {
            under_check = true;
        }
    });

    return under_check;
}

/**
 * Null or Empty
 * Returns if the input is null or empty
 * @param {any} i 
 * @returns Boolean 
 */
function noe(i) {
    return [undefined, null, ''].indexOf(i) > -1;
}

init_game();
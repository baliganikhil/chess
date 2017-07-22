var CONSTANTS,
    DEBUG,
    STATE,
    PIECE,
    SQUARE;

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
    update_current_colour: function (colour) {
        STATE.cur_colour = colour;
        $('.colour_to_move').text(colour);
    },

    captured: {
        white: [],
        black: []
    },

    add_captured_piece: function (colour, piece_type) {
        STATE.captured[colour].push(piece_type);
    },

    clear_states: function () {
        STATE.update_current_colour(CONSTANTS.COLOURS.WHITE);
        STATE.captured.white = [];
        STATE.captured.black = [];
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
    $('[data-row_index="' + white_king_index[0] + '"][data-col_index="' + white_king_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.KING, CONSTANTS.COLOURS.BLACK);
    $('[data-row_index="' + black_king_index[0] + '"][data-col_index="' + black_king_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    // Init Queens
    piece = piece_factory(CONSTANTS.PIECES.QUEEN, CONSTANTS.COLOURS.WHITE);
    $('[data-row_index="' + white_queen_index[0] + '"][data-col_index="' + white_queen_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.QUEEN, CONSTANTS.COLOURS.BLACK);
    $('[data-row_index="' + black_queen_index[0] + '"][data-col_index="' + black_queen_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    // Init Bishops
    piece = piece_factory(CONSTANTS.PIECES.BISHOP, CONSTANTS.COLOURS.WHITE);
    $('[data-row_index="' + white_bishop_1_index[0] + '"][data-col_index="' + white_bishop_1_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.BISHOP, CONSTANTS.COLOURS.BLACK);
    $('[data-row_index="' + black_bishop_1_index[0] + '"][data-col_index="' + black_bishop_1_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.BISHOP, CONSTANTS.COLOURS.WHITE);
    $('[data-row_index="' + white_bishop_2_index[0] + '"][data-col_index="' + white_bishop_2_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.BISHOP, CONSTANTS.COLOURS.BLACK);
    $('[data-row_index="' + black_bishop_2_index[0] + '"][data-col_index="' + black_bishop_2_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    // Init Knights
    piece = piece_factory(CONSTANTS.PIECES.KNIGHT, CONSTANTS.COLOURS.WHITE);
    $('[data-row_index="' + white_knight_1_index[0] + '"][data-col_index="' + white_knight_1_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.KNIGHT, CONSTANTS.COLOURS.BLACK);
    $('[data-row_index="' + black_knight_1_index[0] + '"][data-col_index="' + black_knight_1_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.KNIGHT, CONSTANTS.COLOURS.WHITE);
    $('[data-row_index="' + white_knight_2_index[0] + '"][data-col_index="' + white_knight_2_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.KNIGHT, CONSTANTS.COLOURS.BLACK);
    $('[data-row_index="' + black_knight_2_index[0] + '"][data-col_index="' + black_knight_2_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    // Init Rooks
    piece = piece_factory(CONSTANTS.PIECES.ROOK, CONSTANTS.COLOURS.WHITE);
    $('[data-row_index="' + white_rook_1_index[0] + '"][data-col_index="' + white_rook_1_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.ROOK, CONSTANTS.COLOURS.BLACK);
    $('[data-row_index="' + black_rook_1_index[0] + '"][data-col_index="' + black_rook_1_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.ROOK, CONSTANTS.COLOURS.WHITE);
    $('[data-row_index="' + white_rook_2_index[0] + '"][data-col_index="' + white_rook_2_index[1] + '"]').append(piece);
    make_piece_draggable(piece);

    piece = piece_factory(CONSTANTS.PIECES.ROOK, CONSTANTS.COLOURS.BLACK);
    $('[data-row_index="' + black_rook_2_index[0] + '"][data-col_index="' + black_rook_2_index[1] + '"]').append(piece);
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
        
        allowed_positions = [
            [new_row_index, col_index]
        ];

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

        // for (i = 1; i < 8; i++) {
        //     allowed_positions.push([row_index - i, col_index - i]);
        //     allowed_positions.push([row_index - i, col_index + i]);
        //     allowed_positions.push([row_index + i, col_index - i]);
        //     allowed_positions.push([row_index + i, col_index + i]);
        // }

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
        };

    for (i = 1; i < 8; i++) {
        if (can_go.up) {
            colour_at_position = SQUARE.has_piece_at(row_index - i, col_index);

            // If the piece at the position is same colour as current piece
            if (colour_at_position === STATE.cur_colour) {
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
            if (colour_at_position === STATE.cur_colour) {
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
            if (colour_at_position === STATE.cur_colour) {
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
            if (colour_at_position === STATE.cur_colour) {
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
        };

    for (i = 1; i < 8; i++) {
        if (can_go.up) {
            colour_at_position = SQUARE.has_piece_at(row_index - i, col_index - i);

            // If the piece at the position is same colour as current piece
            if (colour_at_position === STATE.cur_colour) {
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
            if (colour_at_position === STATE.cur_colour) {
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
            if (colour_at_position === STATE.cur_colour) {
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
            if (colour_at_position === STATE.cur_colour) {
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
 * Null or Empty
 * Returns if the input is null or empty
 * @param {any} i 
 * @returns Boolean 
 */
function noe(i) {
    return [undefined, null, ''].indexOf(i) > -1;
}

init_game();
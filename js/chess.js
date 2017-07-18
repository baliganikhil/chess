var CONSTANTS,
    DEBUG,
    STATE;

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
    is_piece_moving: false
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

/**
 * Draw Board
 * Draw Pieces
 */
function init_board() {
    draw_board();
    init_pieces();
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
    DEBUG.log('Making draggable: ', $(piece).data('piece_type'));

    $(piece).on('mouseover', function () {
        var piece_type = $(piece).data('piece_type'),
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
        remove_all_droppable();
    });

    /**
     * Makes the current pawn draggable
     * 
     * @param {any} piece 
     * @param {any} row_index 
     * @param {any} col_index 
     */
    function make_pawn_draggable(piece, row_index, col_index) {
        var has_moved = $(piece).data('has_moved'),
            colour = $(piece).data('colour'),
            new_row_index = colour === CONSTANTS.COLOURS.WHITE ? row_index - 1 : row_index + 1,
            allowed_positions = [];
        
        allowed_positions = [
            [new_row_index, col_index]
        ];

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
        
        for (i = 0; i < 8; i++) {
            allowed_positions.push([row_index - i, col_index]);
            allowed_positions.push([row_index + i, col_index]);
            allowed_positions.push([row_index, col_index - i]);
            allowed_positions.push([row_index, col_index + i]);
        }

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

        for (i = 1; i < 8; i++) {
            allowed_positions.push([row_index - i, col_index - i]);
            allowed_positions.push([row_index - i, col_index + i]);
            allowed_positions.push([row_index + i, col_index - i]);
            allowed_positions.push([row_index + i, col_index + i]);
        }

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
            allowed_positions = []

        // Slant
        for (i = 1; i < 8; i++) {
            allowed_positions.push([row_index - i, col_index - i]);
            allowed_positions.push([row_index - i, col_index + i]);
            allowed_positions.push([row_index + i, col_index - i]);
            allowed_positions.push([row_index + i, col_index + i]);
        }
        
        // Vertical
        for (i = 0; i < 8; i++) {
            allowed_positions.push([row_index - i, col_index]);
            allowed_positions.push([row_index + i, col_index]);
            allowed_positions.push([row_index, col_index - i]);
            allowed_positions.push([row_index, col_index + i]);
        }

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
        allowed_positions.forEach(function (allowed_position) {
            $('[data-row_index="' + allowed_position[0] + '"][data-col_index="' + allowed_position[1] + '"]').
                droppable({
                    activeClass: 'allowed_position',
                    drop: function (event, ui) {
                        var new_piece = clone_piece($(ui.draggable));
                        $(ui.draggable).remove();
                        $(this).append(new_piece);
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
    var piece_type = $(piece).data('piece_type'),
        colour = $(piece).data('colour');

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
 * Null or Empty
 * Returns if the input is null or empty
 * @param {any} i 
 * @returns Boolean 
 */
function noe(i) {
    return [undefined, null, ''].indexOf(i) > -1;
}

init_board();
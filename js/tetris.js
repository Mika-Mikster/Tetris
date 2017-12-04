/**
 * Created by michaelya on 06/11/2017.
 */
const canvas  = screen.width >= 480 ? document.getElementById( 'tetris-screen' ) : document.getElementById( 'tetris-screen-mobile' );
const context = canvas.getContext( '2d' );
if (screen.width >= 480 ){
    context.scale( 25, 25 );
} else {
    context.scale( 19, 45 )
}

function arenaSweep() {
    let rowCount = 1;
    outer: for ( let y = arena.length - 1; y > 0; --y ) {
        for ( let x = 0; x < arena[ y ].length; ++x ) {
            if ( arena[ y ][ x ] === 0 ) {
                continue outer;
            }
        }
        const row = arena.splice( y, 1 )[ 0 ].fill( 0 );
        arena.unshift( row );
        ++y;
        
        player.score += rowCount * 10;
        rowCount += 2;
    }
}

function createSave( w, h ) {
    const save = [];
    while ( h-- ) {
        save.push( new Array( w ).fill( 0 ) );
    }
    return save;
}

function collide( arena, player ) {
    const [ p, o ] = [ player.piece, player.pos ];
    for ( let y = 0; y < p.length; ++y ) {
        for ( let x = 0; x < p[ y ].length; ++x ) {
            if ( p[ y ][ x ] !== 0 && (arena[ y + o.y ] && arena[ y + o.y ][ x + o.x ]) !== 0 ) {
                return true;
            }
        }
    }
    return false;
}

function createPiece( type ) {
    if ( type === 'I' ) {
        // context.fillStyle = 'cyan';
        return [
            [ 0, 1, 0, 0 ],
            [ 0, 1, 0, 0 ],
            [ 0, 1, 0, 0 ],
            [ 0, 1, 0, 0 ],
        ];
    }
    if ( type === 'O' ) {
        // context.fillStyle = 'yellow';
        return [
            [ 2, 2 ],
            [ 2, 2 ],
        ];
    }
    if ( type === 'T' ) {
        // context.fillStyle = 'purple';
        return [
            [ 3, 3, 3 ],
            [ 0, 3, 0 ],
            [ 0, 0, 0 ],
        ];
    }
    if ( type === 'S' ) {
        // context.fillStyle = 'green';
        return [
            [ 0, 4, 4 ],
            [ 4, 4, 0 ],
            [ 0, 0, 0 ],
        ];
    }
    if ( type === 'Z' ) {
        // context.fillStyle = 'red';
        return [
            [ 5, 5, 0 ],
            [ 0, 5, 5 ],
            [ 0, 0, 0 ],
        ];
    }
    if ( type === 'J' ) {
        // context.fillStyle = 'blue';
        return [
            [ 0, 6, 0 ],
            [ 0, 6, 0 ],
            [ 6, 6, 0 ],
        ];
    }
    if ( type === 'L' ) {
        // context.fillStyle = 'orange';
        return [
            [ 0, 7, 0 ],
            [ 0, 7, 0 ],
            [ 0, 7, 7 ],
        ];
    }
}

const colors = [
    null,
    'cyan',
    'yellow',
    'purple',
    'green',
    'red',
    'blue',
    'orange',
];

function draw() {
    context.fillStyle = '#000';
    context.fillRect( 0, 0, canvas.width, canvas.height );
    
    drawPiece( arena, { x: 0, y: 0 } );
    drawPiece( player.piece, player.pos );
}

function drawPiece( piece, offset ) {
    piece.forEach( ( row, y ) => {
        row.forEach( ( value, x ) => {
            if ( value !== 0 ) {
                context.fillStyle = colors[ value ];
                context.fillRect( x + offset.x,
                    y + offset.y,
                    1, 1 );
            }
        } )
    } )
}

function merge( arena, player ) {
    player.piece.forEach( ( row, y ) => {
        row.forEach( ( value, x ) => {
            if ( value !== 0 ) {
                arena[ y + player.pos.y ][ x + player.pos.x ] = value;
            }
        } );
    } );
}

function playerDrop() {
    player.pos.y++;
    if ( collide( arena, player ) ) {
        player.pos.y--;
        merge( arena, player );
        playerReset();
        arenaSweep();
        updateScore();
    }
    dropCounter = 0;
}

function playerMove( dir ) {
    player.pos.x += dir;
    if ( collide( arena, player ) ) {
        player.pos.x -= dir;
    }
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.piece = createPiece( pieces[ pieces.length * Math.random() | 0 ] );
    player.pos.y = 0;
    player.pos.x = (arena[ 0 ].length / 2 | 0) - (player.piece[ 0 ].length / 2 | 0);
    if ( collide( arena, player ) ) {
        arena.forEach( (row => row.fill( 0 )) );
        player.score = 0;
        updateScore();
    }
}

function playerRotate( dir ) {
    const pos  = player.pos.x;
    let offset = 1;
    rotate( player.piece, dir );
    while ( collide( arena, player ) ) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if ( offset > player.piece[ 0 ].length ) {
            rotate( player.piece, -dir );
            player.pos.x = pos;
            return;
        }
    }
}

function rotate( piece, dir ) {
    for ( let y = 0; y < piece.length; ++y ) {
        for ( let x = 0; x < y; ++x ) {
            [
                piece[ x ][ y ],
                piece[ y ][ x ],
            ] = [
                piece[ y ][ x ],
                piece[ x ][ y ],
            ];
        }
    }
    
    if ( dir > 0 ) {
        piece.forEach( row => row.reverse() );
    } else {
        piece.reverse();
    }
}

let dropCounter  = 0;
let dropInterval = 1000;

let lastTime = 0;

function update( time = 0 ) {
    const deltaTime = time - lastTime;
    lastTime        = time;
    dropCounter += deltaTime;
    if ( dropCounter > dropInterval ) {
        playerDrop();
    }
    draw();
    requestAnimationFrame( update );
}

function updateScore() {
    document.getElementById( 'score' ).innerText = player.score;
}

const player = {
    pos: { x: 6, y: 0 },
    piece: null,
    score: 0,
};

const arena = createSave( 16, 28 );

document.addEventListener( 'keydown', event => {
    if ( event.keyCode === 37 ) {
        playerMove( -1 );
    } else if ( event.keyCode === 39 ) {
        playerMove( 1 );
    } else if ( event.keyCode === 40 ) {
        playerDrop();
    } else if ( event.keyCode === 32 ) {
        playerRotate( -1 );
    } else if ( event.keyCode === 16 ) {
        playerRotate( 1 );
    }
} );

playerReset();

update();

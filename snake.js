var canvas = document.getElementById('cvGame');

/*********************************************************************/ 
/*thanks to Jemenake (http://stackoverflow.com/users/265932/jemenake)*/ 
/*http://stackoverflow.com/a/30688151/204723**************************/
function setResizeHandler(callback, timeout) {
    var timer_id = undefined;
    window.addEventListener("resize", function() {
        if(timer_id != undefined) {
            clearTimeout(timer_id);
            timer_id = undefined;
        }
        timer_id = setTimeout(function() {
            timer_id = undefined;
            callback();
        }, timeout);
    });
}
/*********************************************************************/

window.requestAnimFrame = (function(callback){
    return window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback){
        window.setTimeout(callback, 1);
    };
})();

var direction = {left:0, up:1, right:2, down:3};

var boardWidth = 64;

var width = window.innerWidth - 4;
var height = window.innerHeight - 4;
canvas.width = width;
canvas.height = height;
var sectionHeight = height/boardWidth;
var sectionWidth = width/boardWidth;

var context = canvas.getContext("2d");

function setSnakeSizes()
{
    width = window.innerWidth - 4;
    height = window.innerHeight - 4;
    canvas.width = width;
    canvas.height = height;
    sectionHeight = height/boardWidth;
    sectionWidth = width/boardWidth;
    context = canvas.getContext("2d");
}

setResizeHandler(setSnakeSizes, 350);

function snakeSection(x, y, dir)
{
    this.x = x;
    this.y = y;
    this.direction = dir;
    this.turningPoints = [];
    this.turnCallBacks = [];
}

snakeSection.prototype.move = function()
{
    switch(this.direction)
    {
    case direction.right:
	this.x += 1;
	break;
    case direction.left:
	this.x -= 1;
	break;
    case direction.up:
	this.y -= 1;
	break;
    case direction.down:
	this.y += 1;
	break;
    default:
	break;
    }

    if(this.turningPoints.length > 0)
    {
	if(this.x == this.turningPoints[0].x && this.y == this.turningPoints[0].y)
	{
	    var tp = this.turningPoints.shift();
	    this.direction = tp.direction;
	}
    }
};

snakeSection.prototype.addTurningPoint = function(turningPoint)
{
    this.turningPoints.push(turningPoint);
};

function snake()
{
    this.body = [new snakeSection(0, 0, direction.down)];
}

snake.prototype.move = function()
{
    for(var secI = 0; secI < this.body.length; secI++)
    {
	this.body[secI].move()
    }
    return this.checkCollision();
};

snake.prototype.checkCollision = function()
{
    for(var secI = 1; secI < this.body.length; secI++)
    {
	if(this.body[0].x == this.body[secI].x && this.body[0].y == this.body[secI].y)
	{
	    return true;
	}
    }

    if(this.body[0].x < 0 || this.body[0].y < 0)
    {
	return true;
    }

    if(this.body[0].x >= boardWidth || this.body[0].y >= boardWidth)
    {
	return true;
    }

    return false;
};

snake.prototype.turn = function(left)
{
    if(left)
    {
	this.body[0].direction++;
	if(this.body[0].direction > direction.down)
	{
	    this.body[0].direction = direction.left;
	}
    }
    else
    {
	this.body[0].direction--;
	if(this.body[0].direction < direction.left)
	{
	    this.body[0].direction = direction.down;
	}
    }

    for(var secI = 1; secI < this.body.length; secI++)
    {
	this.body[secI].addTurningPoint({x:this.body[0].x, y:this.body[0].y, direction:this.body[0].direction});
    }    
};

snake.prototype.addSection = function()
{
    var secI = this.body.length - 1;
    var curSec = this.body[secI];
    var x = curSec.x;
    var y = curSec.y;
    switch(this.body[secI].direction)
    {
    case direction.right:
	x--;
	break;
    case direction.down:
	y--;
	break;
    case direction.left:
	x++;
	break;
    case direction.up:
	y++;
	break;
    default:
	break;
    }

    var section = new snakeSection(x, y, curSec.direction);

    for(var tpi = 0; tpi < curSec.turningPoints.length; tpi++)
    {
	section.addTurningPoint(curSec.turningPoints[tpi]);
    }

    this.body.push(section);
};

var state = {firstRun:0, playing:2, stopped:3, newGame:4};

function board()
{
    this.snake = new snake();
    this.piece = {x:0, y:0};
    this.state = state.firstRun;
}

board.prototype.draw = function()
{
    context.clearRect(0, 0, width, height);

    switch(this.state)
    {
    case state.firstRun:
	{
	    context.fillStyle = '#FFFFFF';
	    context.font = round(sectionHeight*8)+'px "courier new"';
	    var m = context.measureText('New Game');
	    context.fillText('New Game', round(width/2 - (m.width/2)), round(height/2));
	    context.font = round(sectionHeight*2.5)+'px "courier new"';
	    m = context.measureText('Tap left for clockwise, tap right for anticlockwise');
	    context.fillText('Tap left for clockwise, tap right for anticlockwise', round(width/2 - (m.width/2)), round(height/2) + round(sectionHeight*2.75));
	}
	break;
    case state.playing:
	{
	    context.fillStyle = '#FFFFFF';

	    for(var secI = 0; secI < this.snake.body.length; secI++)
	    {
		var section = this.snake.body[secI];
		var x = round((section.x*sectionWidth));
		var y = round((section.y*sectionHeight));
		context.fillRect(x, y, round(sectionWidth), round(sectionHeight));
	    }

	    context.fillStyle = '#FF0000';

	    var pieceX = round(this.piece.x*sectionWidth);
	    var pieceY = round(this.piece.y*sectionHeight);
	    context.fillRect(pieceX, pieceY, round(sectionWidth), round(sectionHeight));
	}
	break;
    case state.newGame:
	{
	    context.fillStyle = '#FFFFFF';
	    var textHeight = round(sectionHeight*8);
	    context.font = textHeight+'px "courier new"';
	    var m = context.measureText('Game Over');
	    context.fillText('Game Over', round(width/2 - (m.width/2)), round(height/2 - (2*textHeight)));
	    var score = 'Score: ' + this.snake.body.length;
	    m = context.measureText(score);
	    context.fillStyle = '#FFFF00';
	    context.fillText(score, round(width/2 - (m.width/2)), round(height/2 - textHeight));
	    var m = context.measureText('New Game');
	    context.fillStyle = '#FFFFFF';
	    context.fillText('New Game', round(width/2 - (m.width/2)), round(height/2));
	    context.font = round(sectionHeight*2.5)+'px "courier new"';
	    m = context.measureText('Tap left for clockwise, tap right for anticlockwise');
	    context.fillText('Tap left for clockwise, tap right for anticlockwise', round(width/2 - (m.width/2)), round(height/2) + round(sectionHeight*2.75));
	}
	break;
    default:
	break;
    }
};

board.prototype.run = function()
{
    switch(this.state)
    {
    case state.playing:
	{
	    var collision = this.snake.move();
	    this.checkPieceEaten();
	}
	break;
    case state.stopped:
	this.state = state.newGame;
	break;
    default:
	break;
    }

    this.draw();

    if(collision)
    {
	this.state = state.stopped;
	console.log('crash!');
    }

    var that = this;
    setTimeout(function()
	       {
		   requestAnimFrame(that.run.bind(that));
	       }, 1000/10);
};

board.prototype.checkPieceEaten = function()
{
    if(this.piece.x == this.snake.body[0].x && this.piece.y == this.snake.body[0].y)
    {
	this.snake.addSection();
	this.placePiece();
    }
};

board.prototype.placePiece = function()
{
    var usedXs = this.snake.body.map(function(s) {return s.x;});
    var usedYs = this.snake.body.map(function(s) {return s.y;});

    var xs = [];
    for(var x = 0; x < boardWidth; x++)
    {
	if(usedXs.indexOf(x) != -1)
	{
	    continue;
	}
	xs.push(x);
    }

    var ys = [];
    for(var y = 0; y < boardWidth; y++)
    {
	if(usedYs.indexOf(y) != -1)
	    continue;
	ys.push(y);
    }

    var xi = Math.floor(Math.random() * xs.length);
    var yi = Math.floor(Math.random() * ys.length);

    this.piece = {x:xs[xi], y:ys[yi]};
};

board.prototype.restart = function()
{
    this.snake = new snake();
    this.placePiece();
    this.state = state.playing;
};

board.prototype.interact = function(e)
{			
    switch(this.state)
    {
    case state.playing:
	{
	    var left = false;

	    var x = e.clientX;

	    if(!e.clientX)
	    {
		x = e.originalEvent.touches[0].pageX;
	    }

	    if(x - (canvas.clientWidth/2) <= 0)
	    {
		left = true;
	    }
	    
	    this.snake.turn(left);
	}
	break;
    case state.newGame:
    case state.firstRun:
	this.restart()
    }
};

function round(value)
{
    return (0.5 + value) | 0;
}

var game = new board();

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) 
{
    canvas.addEventListener('touchend', game.interact.bind(game)); 
}
else
{
    canvas.addEventListener('mouseup', game.interact.bind(game));
}

game.placePiece();

game.run()

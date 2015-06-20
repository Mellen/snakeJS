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

canvas.addEventListener('mouseup', function(e)
			{
			    var left = false;
			    if(e.clientX - (canvas.clientWidth/2) <= 0)
			    {
				left = true;
			    } 

			    console.log(left?'left':'right');
			});

var direction = {left:0, up:1, right:2, down:3};

var boardWidth = 48;

var width = canvas.clientWidth;
var height = canvas.clientHeight;
var sectionHeight = height/boardWidth;
var sectionWidth = width/boardWidth;

function setSnakeSizes()
{
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    sectionHeight = height/boardWidth;
    sectionWidth = width/boardWidth;
}

setResizeHandler(setSnakeSizes, 350);

function snakeSection(x, y, dir)
{
    this.x = x;
    this.y = y;
    this.direction = dir;
    this.turningPoints = [];
}

snakeSection.prototype.move = function()
{
    switch(this.direction)
    {
    case direction.right:
	this.x++;
	break;
    case direction.left:
	this.x--;
	break;
    case direction.up:
	this.y--;
	break;
    case direction.down:
	this.y++;
	break;
    default:
	break;
    }

    if(this.turningPoints.length > 0)
    {
	if(this.x == this.turningPoints[0].x && this.y == this.turningPoints[0].y)
	{
	    var tp = this.turningPoints.unshift();
	    this.direction = tp.direction;
	}
    }
}

snakeSection.prototype.addTurningPoint = function(turningPoint)
{
    this.turningPoints.push(turningPoint);
}

function snake()
{
    this.body = [new snakeSection(0, 0, direction.down)];
    this.direction = direction.down;
}

snake.prototype.move = function()
{
    for(var secI = 0; secI < this.body.length; secI++)
    {
	this.body[secI].move()
    }
    return this.checkCollision();
}

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

    if(this.body[0].x > boardWidth || this.body[0].y > boardWidth)
    {
	return true;
    }

    return false;
}

snake.prototype.turn = function(left)
{
    if(left)
    {
	this.body[0].direction--;
	if(this.body[0].direction < direction.left)
	{
	    this.body[0].direction = direction.down;
	}
    }
    else
    {
	this.body[0].direction++;
	if(this.body[0].direction > direction.down)
	{
	    this.body[0].direction = direction.left;
	}
    }

    for(var secI = 1; secI < this.body.length; secI++)
    {
	this.body[secI].addTurningPoint({x:this.body[0].x, this.body[0].y, this.body[0].direction});
    }    
}

snake.prototype.addSection()
{
    //todo: add a section
}

function board()
{
    this.snake = new snake();
    this.piece = {x:0, y:0};
}
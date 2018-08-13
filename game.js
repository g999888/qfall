
/* 
	game.js

	A tetris game, cos i always wanted to make one too
	g12345, for LD 42
*/

window.onload = function()
{
	Game.launch("screen");
}

dataFiles = ["font3.png", "blocks.png"];
soundFiles = []; 

filesLeft = 10;  

Images = [];
Sounds = [];

musicPlaying = 0;

mx = 0;
my = 0;

TileSize = 16;

map0 = 0;

distanceToEnd = 100;

HP = 10;

totalClicks = 0;

var score = 0;

tileO= 
[ 1, // rotations
 [  
	2, // width
	2, // height
	[1,1],
	[1,1]
 ]
];

tileT= 
[ 4, // rotations
 [  
	3, // width
	2, // height
	[1,1,1],
	[0,1,0]
 ],
 [
	2, // width
	3, // height
	[0,1],
	[1,1],
	[0,1]
 ],
 [
	3, // width
	2, // height
	[0,1,0],
	[1,1,1]
 ],
 [
	2, // width
	3, // height
	[1,0],
	[1,1],
	[1,0]
 ]
];

tileL= 
[ 4, // rotations
 [  
	3, // width
	2, // height
	[1,1,1],
	[1,0,0]
 ],
 [
	2, // width
	3, // height
	[1,1],
	[0,1],
	[0,1]
 ],
 [
	3, // width
	2, // height
	[0,0,1],
	[1,1,1]
 ],
 [
	2, // width
	3, // height
	[1,0],
	[1,0],
	[1,1]
 ]
];

tileJ= 
[ 4, // rotations
 [  
	3, // width
	2, // height
	[1,1,1],
	[0,0,1]
 ],
 [
	2, // width
	3, // height
	[0,1],
	[0,1],
	[1,1]
 ],
 [
	3, // width
	2, // height
	[1,0,0],
	[1,1,1]
 ],
 [
	2, // width
	3, // height
	[1,1],
	[1,0],
	[1,0]
 ]
];

tileS= 
[ 2, // rotations
 [
	3, // width
	2, // height
	[0,1,1],
	[1,1,0]
 ],
 [
	2, // width
	3, // height
	[1,0],
	[1,1],
	[0,1]
 ]
];

tileZ= 
[ 2, // rotations
 [
	3, // width
	2, // height
	[1,1,0],
	[0,1,1]
 ],
 [
	2, // width
	3, // height
	[0,1],
	[1,1],
	[1,0]
 ]
];

tileI= 
[ 2, // rotations
 [
	4, // width
	1, // height
	[1,1,1,1]
 ],
 [
	1, // width
	4, // height
	[1],
	[1],
	[1],
	[1]
 ]
];

tiles = [tileS, tileZ, tileL, tileJ, tileT, tileO, tileI ];

KEYS = { LEFT:37, UP:38, RIGHT:39, DOWN:40, SPACE:32, ENTER:13, BACKSPACE:8 };

var Keyboard = function()
{
	var keysPressed = {};
	
	window.onkeydown = function(e) { keysPressed[e.keyCode] = true; };
	window.onkeyup = function(e) { keysPressed[e.keyCode] = false;	};
	this.isDown = function(keyCode)	{ return keysPressed[keyCode] === true; };
};



function fileLoaded(filename)
{
	filesLeft --;
	console.log(filename + " loaded.");
}

function loadFile(filename, nr)
{
	var img = new Image();
	img.addEventListener('load', fileLoaded(filename));
	img.src = filename;
	Images.push(img);
}

function loadMusicFile(filename)
{
	var snd = new Audio();
	snd.addEventListener('load', fileLoaded(filename));
	snd.src = filename;
	Sounds.push(snd);
}

fontSize = 16;
function sprint(screen,x,y,s)
// prints a string at x,y, no wrapping
{
	var px = x;
	var py = y;
	for (var i=0; i<s.length; i++)
	{
		c = s.charCodeAt(i);
		if ( (c>=97) && (c<=122) ) c-=32;
		if ( (c>=32) && (c<=95) )
		screen.drawImage (Images[0], (c-32)*fontSize,0, fontSize,fontSize, px,py, fontSize,fontSize);
		px += fontSize;
	}
}

function sprintnum(screen,x,y,n)
// prints a number at x,y, no wrapping
{
	sprint(screen,x,y,n+'');
}


Buttons = [ {x: 30, y: 60, w:64, h:64 }, {x: 30, y: 128, w:64, h:64 }, {x: 30, y: 192, w:64, h:64 }, {x: 30, y: 256, w:64, h:64 }, 
			{x: (800/2), y: 60, w:64, h:64 }, {x: (800/2), y: 128, w:64, h:64 }, {x: (800/2), y: 192, w:64, h:64 }, {x: (800/2), y: 256, w:64, h:64 },  ];


function is_wall(x,y)
// check if map coord (x,y) is a wall block or not
// monsters doesn't count.
{
	var c = map0[y][x];
	if ((c >= 4) && (c<8))
	{
		score ++;
		map0[y][x] = 0;
	}
	return ((c > 10) && (c !=45+6));
}

function is_floor(x,y)
// check if map coord (x,y) is a wall block or not
// monsters doesn't count.
{
	return (map0[y][x] > 10);
}

function is_wall2(x,y)
// check if PIXEL coord (x,y) is a wall block or not
// monsters doesn't count.
{
	return is_wall(Math.floor(x/TileSize), Math.floor(y/TileSize));
}

function is_floor2(x,y)
// check if PIXEL coord (x,y) is a wall block or not
// monsters doesn't count.
{
	return is_floor(Math.floor(x/TileSize), Math.floor(y/TileSize));
}

var mouseX = 0;
var mouseY = 0;
var mouseP = 0;
var mouseI = 0;
var mouseJ = 0;
var canvasi;
	
function getMousePos(canvas, event) 
{
	var rect = canvas.getBoundingClientRect();
	if ((event.pageX != undefined) && (event.pageY != undefined))
	{
		mouseX = event.pageX;
		mouseY = event.pageY;
	}
	else
	{
		mouseX = event.clientX;
		mouseY = event.clientY;
	}
	mouseX -= rect.left;
	mouseY -= rect.top;
	mouseX = Math.floor(mouseX);
	mouseY = Math.floor(mouseY);
}
	
function mouse_is_inside(b)
{
	if  ((mouseX > b.x) && (mouseY > b.y) && (mouseX < b.x+b.w) && (mouseY < b.y+b.h))
		return 1;
	return 0;
}

buildings = [];

window.onmousemove = function(e) 
				{ 
					getMousePos( canvasi, e );
				};
					
window.onmousedown = function(e) 
				{ 
					getMousePos( canvasi, e );
					if ((mouseP == 0) && (e.buttons == 1))
					{
						mouseJ = 0;
						for (var i=0; i< Buttons.length; i++)
							if (mouse_is_inside(Buttons[i]))
								mouseJ = i+1;
						if (mouseJ > 0)
						{
							// console.log("mouseJ :"+mouseJ);
							if (buildings.length >= mouseJ)
							{
								//for (var i=0; i< 25; i++)
								buildings[mouseJ-1].buy();
							}
						}
					}
					mouseP = e.buttons;
				};

window.onmouseup = function(e) 
				{ 
					getMousePos( canvasi, e );
					mouseP = 0;
				};

Game = {};

people = [];
money = 0;
ticks = 0;

Game.launch = function(canvasId)
{
	var canvas = document.getElementById(canvasId);
	var screen = canvas.getContext('2d');
	var gameSize = { x: canvas.width, y: canvas.height };
	
	// gameMode: 0 = start screen; 1 = game; 2 = game over;
	var gameMode = 0;
	
	canvasi = canvas;
	
	people = [ new Player() ];
	
	
	filesLeft = dataFiles.length + soundFiles.length;
	
	for (var i=0; i<dataFiles.length; i++)
		loadFile(dataFiles[i], i);
	for (var i=0; i<soundFiles.length; i++)
		loadMusicFile(soundFiles[i], i);
	
	
	score = 0;
	var depth = 0;
	
	{
		totalClicks = 0;
	}

	var update = function()
	{
		if (gameMode === 1)
		{
			for (var i=people.length-1; i>=0; i--)
				people[i].update();
			
			if (people[0].keyb.isDown(KEYS.ENTER))
			{
				
				makeMap();
				score = 0;
				people[0].x = 5;
				people[0].y = 0;
				people[0].r = 0;
				people[0].tile=	Math.floor(Math.random()*7)+1;
				if (people[0].tile>6) people[0].tile=6;

			}
			
		}
		else
		{
			if (people[0].keyb.isDown(KEYS.ENTER))
			{
				if (gameMode === 0) gameMode = 1;
				if (gameMode === 3) gameMode = 1;
			}
		}
	}
	
	var camerax = 0;
	var cameray = 0;
	var clockticks = -1;
	
	
	
	    my = 20+1;
	    mx = 12+2;
	var sy = my;
	var sx = mx;
	
	
	map0 = new Array(my);
	
	for (var y=0; y<my; y++)
	{
		map0[y] = new Array(mx);
	}

	var makeMap = function()
	{
		for (var y=0; y<my; y++)
		{
			for (var x=0; x<mx; x++)
			{
				var c = 0;
				map0[y][x] = 0;
								
				// muurtjes
				c = Math.floor(Math.random()*3);
				if (y === my-1) map0[y][x] = 8+c;
				if (x === 0) map0[y][x] = 8+c;
				if (x === mx-1) map0[y][x] = 8+c;
			}
		}
		
	}
	
	makeMap();
	score = 0;
	
	var draw = function(screen, gameSize, clockticks)
	{
		if (gameMode === 1)
		{
/*
			camerax = (people[0].center.x / TileSize) - (sx/2);
			if (camerax < 0) camerax = 0;
			if (camerax > mx-sx) camerax = mx-sx;

			cameray = (people[0].center.y / TileSize) - (sy/2);
			if (cameray < 0) cameray = 0;
			if (cameray > my-sy) cameray = my-sy;
*/
			camerax = 0;
			cameray = 0;
			startx = 200;
			starty = 0;
			var startx = Math.floor(camerax); 
			var restx = Math.floor( (camerax - startx) * TileSize );
			var starty = Math.floor(cameray); 
			var resty = Math.floor( (cameray - starty) * TileSize );
			// console.log(startx, starty);
			
			for (var x=0; x<=sx; x++)
			for (var y=0; y<=sy; y++)
			{
				screen.drawImage (Images[1],
					0,0, 
					TileSize,TileSize, 
					x*TileSize - restx,y*TileSize - resty, 
					TileSize,TileSize);
				if ( (starty+y<my) && (map0[starty+y][startx+x] > 0) )
				{
					screen.drawImage (Images[1], 
						(map0[starty+y][startx+x]%11)*TileSize, (Math.floor(map0[starty+y][startx+x]/11)) *TileSize, 
						TileSize,TileSize, 
						x*TileSize - restx,y*TileSize - resty, 
						TileSize,TileSize);
				}
			}
			
			people[i].draw(screen, camerax, cameray);

		}
	
		if (gameMode === 0)
		{
			screen.fillStyle="black";
			screen.fillRect(0,0, gameSize.x, gameSize.y);
			
			sprint (screen, 250, 100, "QuadroFall");
			sprint (screen, 250, 150, "A game made in 2 hours, sorry");
/*
			sprint (screen, 16, 170, "Click on the boxes to buy yourself enough Power.");
			sprint (screen, 16, 190, "Every 25 of a power gives x2 speed bonus.");
			sprint (screen, 16, 230, "The Background contains my LD34 game, sorry. :)");
*/
			sprint (screen, 250, 250, "Use Arrow keys to move,");
			sprint (screen, 250, 270, "     Space to turn");
			sprint (screen, 250, 290, "Press ENTER to start.");
			sprint (screen, 250, 330, "Made for Ludum Dare 42.");
//			sprint (screen, 16, 384-8-32, "Total Clicks: " + totalClicks );
		}
	}
	
	var tick = function()
	{
		if (filesLeft === 0)
		{
			// console.log ("All files loaded");
			update();
			clockticks ++;
			draw(screen, gameSize, clockticks);
			
			if (!musicPlaying)
			{
				musicPlaying = 1;
				if (Sounds.length > 0)
				{
					Sounds[0].loop = true;
					Sounds[0].play();
				}
			}
		}
		requestAnimationFrame(tick);
	}

	// This to start a game
	tick();
};


var Player = function()
{
	this.tile = 0;
	this.x = 5; this.y=0;
	this.r = 0;
	
	this.keyb = new Keyboard();
	this.counter = 0;
	this.frame1 = 0;
	this.framenr = 1;
	this.type = 0; // player type = 0
	
	this.onfloor = 0; // 0 = falling, 1 = onfloor, 2 = jumping
	this.hold = 0; // how long has the player holding a key?
	this.dir = 0;  // which direction is the player holding?
}

Player.prototype =
{
	touche: function(dx,dy)
	{
				// Check if falling touches any existing tile
				t2 = tiles[this.tile][this.r+1];
				
				for (y=0; y<t2[1]; y++)
				for (x=0; x<t2[0]; x++)
				{
					if (t2[2+y][x]>0) 
						if (map0[this.y+y+dy][this.x+x+dx]>0)
						{
							return 1;
						}
				}
				return 0;
		
	},
	update: function()
	{
	//	if (this.counter%5 === 0)
		
		var nx = this.x;
		var ny = this.y;
		
		if (this.hold==0 && (this.keyb.isDown(KEYS.UP) || this.keyb.isDown(KEYS.SPACE)))
		{
			q = this.r;
			this.r = this.r+1;
			if (this.r >= tiles[this.tile][0]) this.r=0;
			if (this.touche(0,0)) this.r = q;
			this.hold = 10;
		}
		
		if (this.hold==0 && this.keyb.isDown(KEYS.LEFT))
		{
			if (this.x>1)
			{
				if (!this.touche(-1,0))
					this.x = this.x-1;
			}
			this.hold = 10;
		}
		
		if (this.hold==0 && this.keyb.isDown(KEYS.RIGHT))
		{
			if (this.x+tiles[this.tile][this.r+1][0]<mx-1)
			{
				if (!this.touche(1,0))
					this.x = this.x+1;
			}
			this.hold = 10;
		}
		
		if (this.hold>0) this.hold=this.hold-1;
		
		this.counter = this.counter+1;
		if (this.counter>50) this.counter = this.counter - 50;
		
		if (this.counter%10 === 0)
		{
			touched = 0;
			
			if (this.y+tiles[this.tile][this.r+1][1]<my-1)
			{
				touched = this.touche(0,1);
			}
			else
				touched = 1;
			
			if (touched>0)
			{
				for (y=0; y<t2[1]; y++)
				for (x=0; x<t2[0]; x++)
				{
					if (t2[2+y][x]>0) 
						map0[this.y+y][this.x+x] = this.tile+1;
				}
				
				this.x=5; this.y=0;
				this.r=0;
				this.tile=	Math.floor(Math.random()*7)+1;
				if (this.tile>6) this.tile=6;
				
			}
			else
				this.y = this.y+1;
		}
		
		// falling down
//			if ( this.hold > 0 && !this.keyb.isDown(KEYS.LEFT) && !this.keyb.isDown(KEYS.RIGHT) )

	},
	
	draw: function(screen, camerax, cameray)
	{
		t = tiles[this.tile];
		t2 = t[this.r+1];
		
		for (y=0; y<t2[1]; y++)
		for (x=0; x<t2[0]; x++)
		{
			if (t2[2+y][x]>0) 
				screen.drawImage (Images[1], 
					(this.tile+1)*TileSize,0, 
					TileSize, TileSize, 
					(this.x+x)*TileSize,(this.y+y)*TileSize, 
					TileSize, TileSize );
		}
	}
}





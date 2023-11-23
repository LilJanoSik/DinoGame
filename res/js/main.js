const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreP = document.getElementById('score');
const highscoreP = document.getElementById('highscore');
const menuWrapper = document.getElementsByClassName("menu-wrapper")[0];
const playButton = document.getElementById('playButton');

let images = [];
images.length = 10;
let imgPos = 1;
window.onload = () => {
    for(let i = 1; i < images.length; i++){
        images[i] = new Image();
        images[i].src = `../res/img/chomanic (${i}).png`;
    }
    
    setInterval(function(){
        imgPos++;
        if (imgPos >= 10) imgPos = 1;
    },100)
}

const defaultGameSpeed = 5;
let gameSpeed = defaultGameSpeed;
let gravity = 1;
let score = 0;
let highscore = 0;
let player;
let keys = {};

/**
 * Event Listeners
 */
 document.addEventListener('keydown', (e) =>(keys[e.code] = true));
 document.addEventListener('keyup', (e) =>(keys[e.code] = false));

 /**
 * Classes
 */

class Player {
    width = 100;
    height = 100;
    canJump = true;
    jumpCounter = 0;
    jumpForce = 20;
    dY = 0;

    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    update(){
        if (keys["Space"] || keys["KeyW"]){
            this.jump();
        } else {
            this.jumpCounter = 0;
        }
        this.y += this.dY;
        if (this.y + this.height < canvas.height){
            this.canJump = true;
            this.dY += gravity;
        } else {
            this.canJump = false;
            this.y = canvas.height - this.height;
            this.dY;
        }
        ctx.drawImage(images[imgPos], this.x, this.y, this.width,this.height)
        
    }

    jump(){
        if (!this.canJump && this.jumpCounter === 0){
            this.jumpCounter = 1;
            this.dY = -this.jumpForce;
            return ;
        }
        if (this.jumpCounter > 0 && this.jumpCounter < this.jumpForce){
            this.jumpCounter++;
            this.dY = -this.jumpForce - this.jumpCounter / 50;
        }
    }
}

class Obstacle {
    constructor(x, y, w, h, color) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.color = color;
        this.dx= -gameSpeed;
    }
    update() {
        this.x += this.dx;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.w, this.h);
        this.dx = -gameSpeed;
    }
}

/**
 * Utils
 */

 const random = (min, max) => Math.random() * (max - min) +min;

/**
 *  Game Logic
 */

 let spawnTimerValue = 100;
 let spawnTimer = spawnTimerValue;
 
 const resize = () => {
     canvas.width = window.innerWidth;
     canvas.height = window.innerHeight;
 }

 playButton.onclick = () => {
    init();
    window.addEventListener("resize", resize, false);
}

const init = () => {
    menuWrapper.style.display = "none"
    player = new Player(50, 0);
    resize();
    let savedHighScore = Cookies.get('highscore')
    if (savedHighScore !== undefined) {
        highscore = savedHighScore;
        highscoreP.innerHTML = `Highscore : ${highscore}`;
        console.log ("Highscore loaded");
        console.log({savedHighScore})
    } else {
        Cookies.set('highscore', 0);
        console.log("Highscore not found");
    }
    window.requestAnimationFrame(gameLoop);
};

const gameLoop = () => {
    ctx.fillStyle = "rgb(24, 24, 27)"
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    spawnObstacles();
    player.update();
    score++;
    scoreP.innerHTML = `Score: ${score}`;
    if (score > highscore) {
        highscore = score;
        highscoreP.innerHTML = `Highscore: ${highscore}`;
    }
    gameSpeed += 0.005;
    window.requestAnimationFrame(gameLoop);
}

const obstacleW = 50;
let obstacles = [];

const maxObstacles = 2;

const createObstacle = () => {
    let size = random(50, 100);
    let r = random(0, 255);
    let g = random(0, 255);
    let b = random(0, 255);
    const newObstacle = new Obstacle(
        canvas.width + obstacleW,
        canvas.height - size,
        obstacleW,
        size,
        `rgb(${r}, ${g}, ${b})`
    );
    obstacles.push(newObstacle);
};
const spawnObstacles = () => {
    spawnTimer--;
    if (spawnTimer <= 0){
        spawnTimer = spawnTimerValue - gameSpeed * 2;
        if (obstacles.length < maxObstacles) createObstacle();
        if (spawnTimer < 60) spawnTimer = 60;
    }

    obstacles.forEach((obstacle) => {
       if (obstacle.x + obstacle.w <= 0) {
           let size = random(50, 100);
           let r = random(0, 255);
           let g = random(0, 255);
           let b = random(0, 255);
           obstacle.x = canvas.width + obstacleW;
           obstacle.y = canvas.height - size;
           obstacle.w = obstacleW;
           obstacle.h = size;
           obstacle.color =  `rgb(${r}, ${g}, ${b})`;
       }
       if (
           player.x < obstacle.x + obstacle.w &&
           player.x + player.width > obstacle.x &&
           player.y < obstacle.y + obstacle.h &&
           player.y + player.height > obstacle.y
       ) {
           let savedHighScore = Cookies.get('highscore')
           if (highscore > savedHighScore) Cookies.get('highscore',highscore);
           obstacles = [];
           score = 0;
           spawnTimer = spawnTimerValue;
           gameSpeed = defaultGameSpeed;
       }
       obstacle.update();
    });
}
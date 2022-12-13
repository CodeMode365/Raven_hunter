"use strict";
const replayBtn = document.getElementById("replay");
replayBtn.style.display = "none";
replayBtn.onclick = () => {
    retry();
};
const canvas = document.getElementById("shootGame");
const ctxS = canvas.getContext("2d", { willReadFrequently: true });
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const collisioncanvas = document.getElementById("collisionCanvas");
const collisionCTX = collisioncanvas.getContext("2d", { willReadFrequently: true });
collisioncanvas.width = window.innerWidth;
collisioncanvas.height = window.innerHeight;
const smallScreen = canvas.width <= 600 ? true : false;
const music = new Audio();
music.src = "../assets/sounds/music.mp3";
function playMusic() {
    music.play();
    music.onended = () => {
        playMusic();
    };
}
let timeToNextRaven = 0;
let lastTime = 0;
let score = 0;
let ravenIntarval = 2000;
const changeRvnInterval = () => {
    if (score <= 15)
        ravenIntarval = 2000;
    else if (score <= 30)
        ravenIntarval = 1500;
    else if (score <= 45)
        ravenIntarval = 1000;
    else if (score <= 60)
        ravenIntarval = 800;
    else if (score <= 75)
        ravenIntarval = 750;
    else if (score <= 90)
        ravenIntarval = 700;
    else if (score <= 105)
        ravenIntarval = 650;
    else if (score <= 120)
        ravenIntarval = 600;
    else if (score <= 135)
        ravenIntarval = 550;
    else if (score <= 150)
        ravenIntarval = 500;
    else if (score >= 150)
        ravenIntarval = 400;
};
let gameOver = false;
let overCount = 0;
let power = 0;
let explozers = [];
let highScore;
if (localStorage.getItem("highScore")) {
    highScore = parseInt(localStorage.getItem("highScore"));
}
else {
    localStorage.setItem("highScore", "0");
    highScore = 0;
}
class Explosion {
    constructor(x, y, size) {
        this.spriteHeight = 179;
        this.spriteWidth = 200;
        this.explodeImage = new Image();
        this.explodeEffect = new Audio();
        this.frame = 0;
        this.timeSinceLastFrame = 0;
        this.frameInterval = 100;
        this.markedForDeletion = false;
        this.x = x;
        this.y = y;
        this.explodeImage.src = "../assets/boom.png";
        this.explodeEffect.src = "../assets/sounds/gun.mp3";
        this.size = size;
    }
    update(deltaTime) {
        if (this.frame === 0)
            this.explodeEffect.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++;
            this.timeSinceLastFrame = 0;
            if (this.frame > 5) {
                this.markedForDeletion = true;
            }
        }
    }
    draw() {
        ctxS.drawImage(this.explodeImage, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size / 4, this.size, this.size);
    }
}
let Items = [];
class Item {
    constructor(x, y) {
        this.spriteWidth = 150;
        this.spriteHeight = 150;
        this.itemImage = new Image();
        this.timeSinceLastFrame = 0;
        this.frameInterval = 100;
        this.markedForDeletion = false;
        this.width = this.spriteWidth / 3;
        this.height = this.spriteHeight / 3;
        this.angle = 0;
        this.x = x;
        this.y = y;
        this.itemImage.src = "../assets/booster.png";
    }
    update(deltaTime) {
        this.angle += .5;
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.timeSinceLastFrame = 0;
            this.y += Math.sin(this.angle) * 5;
        }
    }
    draw() {
        ctxS.fillStyle = "black";
        ctxS.drawImage(this.itemImage, 0, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
}
let ravens = [];
class Raven {
    constructor() {
        this.creatureImage = new Image();
        this.frame = 0;
        this.maxFrame = 4;
        this.sizeModifier = Math.random() * 0.6 + 0.5;
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.width = this.spriteWidth / 2 * this.sizeModifier;
        this.height = this.spriteHeight / 2 * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.speedModifier = smallScreen ? 2 : 4;
        this.creatureImage.src = "../assets/blue_raven.png";
        if (smallScreen) {
            this.directionX = Math.random() * 2 + 1;
        }
        else {
            this.directionX = Math.random() * this.speedModifier + 3;
        }
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randmColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)];
        this.GenColor = `rgba(${this.randmColor[0]},${this.randmColor[1]},${this.randmColor[2]})`;
        this.hasTrail = Math.random() < .5;
    }
    update(deltaTime) {
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1;
        }
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
            if (this.frame > this.maxFrame) {
                this.frame = 0;
            }
            else {
                this.frame++;
            }
            this.timeSinceFlap = 0;
            if (this.hasTrail) {
                if (score > 40) {
                    particles.push(new Particle(this.x, this.y, this.width, this.GenColor));
                }
            }
        }
        if (this.x < 0 - this.width) {
            this.markedForDeletion = true;
        }
        if (this.x < 0 - this.width)
            gameOver = true;
        this.incSpeed();
    }
    draw() {
        collisionCTX.fillStyle = this.GenColor;
        collisionCTX.fillRect(this.x, this.y, this.width, this.height);
        ctxS.drawImage(this.creatureImage, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height);
    }
    incSpeed() {
        for (let i = 1; i <= 20; i++) {
            switch (score) {
                case 20 * i:
                    this.speedModifier += 0.5;
            }
        }
        if (score <= 50) {
            this.creatureImage.src = "../assets/raven.png";
        }
        else if (score <= 80) {
            this.creatureImage.src = "../assets/pink_raven.png";
        }
        else if (score <= 100) {
            this.creatureImage.src = "../assets/blue_raven.png";
        }
        else if (score <= 150) {
            this.creatureImage.src = "../assets/purple_raven.png";
        }
        else if (score <= 250) {
            this.creatureImage.src = "../assets/yellow_raven.png";
        }
        else if (score <= 250) {
            this.creatureImage.src = "../assets/green_raven.png";
        }
        else if (score <= 300) {
            this.creatureImage.src = "../assets/Boss2.png";
        }
        else {
            this.creatureImage.src = "../assets/red_raven.png";
        }
    }
}
let particles = [];
class Particle {
    constructor(x, y, size, color) {
        this.size = size;
        this.x = x + this.size / 2 + Math.random() * 50 - 25;
        this.y = y + this.size / 3 + Math.random() * 50 - 25;
        this.radius = Math.random() * this.size / 10;
        this.maxRadius = Math.random() * 20 + 35;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
        this.markedTodeletion = false;
    }
    update() {
        this.x += this.speedX;
        this.radius += Math.random() * 0.5;
        if (this.radius > this.maxRadius - 5)
            this.markedTodeletion = true;
    }
    draw() {
        ctxS.save();
        ctxS.globalAlpha = 1 - this.radius / this.maxRadius;
        ctxS.beginPath();
        ctxS.fillStyle = this.color;
        ctxS.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctxS.fill();
        ctxS.restore();
    }
}
function drawScore() {
    ctxS.font = "30px Impact";
    ctxS.fillStyle = "black";
    ctxS.fillText("Score: " + score, 52, 78);
    ctxS.fillStyle = "white";
    ctxS.fillText("Score: " + score, 53, 79);
    ctxS.fillStyle = "black";
    ctxS.fillText("Score: " + score, 54, 79);
    ctxS.fillStyle = "black";
    ctxS.font = "25px Impact";
    ctxS.fillText("Power: " + power, 52, 45);
    ctxS.fillStyle = "white";
    ctxS.fillText("Power: " + power, 53, 46);
    ctxS.fillStyle = "green";
    ctxS.fillText("Power: " + power, 54, 47);
    ctxS.fillStyle = "black";
    ctxS.font = "25px Impact";
    ctxS.fillText("High Score: " + highScore, 52, 136 - 25);
    ctxS.fillStyle = "white";
    ctxS.fillText("High Score: " + highScore, 53, 136 - 25);
    ctxS.fillStyle = "black";
    ctxS.fillText("High Score: " + highScore, 54, 136 - 25);
}
function GAME_OVER() {
    replayBtn.style.display = "block";
    ctxS.textAlign = "center";
    ctxS.font = "30px Impact";
    ctxS.fillStyle = "black";
    ctxS.fillText("GAME OVER", canvas.width / 2 - 4, canvas.height / 2 - 4);
    ctxS.fillStyle = "white";
    ctxS.fillText("GAME OVER", canvas.width / 2 - 2, canvas.height / 2 - 2);
    ctxS.fillStyle = "rgb(230,120,60)";
    ctxS.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
    ctxS.fillStyle = "black";
    ctxS.font = "35px Impact";
    ctxS.fillText("Your Score is: " + score, canvas.width / 2 - 4, canvas.height / 2 + 80 - 4 - 30);
    ctxS.fillStyle = "white";
    ctxS.fillText("Your Score is: " + score, canvas.width / 2 - 2, canvas.height / 2 + 80 - 2 - 30);
    ctxS.fillStyle = "rgb(64,134,74)";
    ctxS.fillText("Your Score is: " + score, canvas.width / 2, canvas.height / 2 + 80 - 30);
    if (score >= highScore) {
        music.src = "../assets/sounds/walk.mp3";
        music.play();
        ctxS.textAlign = "center";
        ctxS.font = "25px Impact";
        ctxS.fillStyle = "black";
        ctxS.fillText("Ya woo you got high Score 🥳🥳", canvas.width / 2 - 4 + 30, canvas.height / 2 + 80 - 4);
        ctxS.fillStyle = "white";
        ctxS.fillText("Ya woo you got high Score 🥳🥳", canvas.width / 2 - 2 + 30, canvas.height / 2 + 80 - 2);
        ctxS.fillStyle = "red";
        ctxS.fillText("Ya woo you got high Score 🥳🥳", canvas.width / 2 + 30, canvas.height / 2 + 80);
        localStorage.setItem("highScore", score.toLocaleString());
    }
    else {
        music.src = "../assets/sounds/crow.wav";
        music.play();
    }
}
window.addEventListener("click", (e) => {
    playMusic();
    const deltectPixelColor = collisionCTX.getImageData(e.x, e.y, 1, 1);
    const pc = deltectPixelColor.data;
    ravens.forEach((raven) => {
        if (raven.randmColor[0] == Math.floor(pc[0]) && raven.randmColor[1] == Math.floor(pc[1]) && raven.randmColor[2] == Math.floor(pc[2])) {
            raven.markedForDeletion = true;
            score++;
            if (Math.random() * 5 > .1) {
                explozers.push(new Explosion(raven.x, raven.y, raven.width));
            }
            else {
                explozers.push(new Explosion(raven.x, raven.y, raven.width));
                Items.push(new Item(raven.x, raven.y));
            }
        }
    });
    if (score > highScore)
        highScore = score;
    Items.forEach((item) => {
        const getItem = new Audio();
        getItem.src = "../assets/sounds/getItem.wav";
        if ((e.offsetX > item.x) &&
            (e.offsetX < item.x + item.width) &&
            (e.offsetY > item.y) &&
            (e.offsetY < item.y + item.height)) {
            getItem.play();
            power++;
            item.markedForDeletion = true;
        }
    });
});
window.addEventListener('keypress', (e) => {
    if (e.key === " " && ravens.length !== 0 && power > 0) {
        power--;
        ravens.forEach((raven) => {
            explozers.push(new Explosion(raven.x, raven.y, raven.width));
            score++;
            raven.markedForDeletion = true;
        });
    }
});
function animate(timestamep) {
    changeRvnInterval();
    ctxS.clearRect(0, 0, canvas.width, canvas.height);
    collisionCTX.clearRect(0, 0, canvas.width, canvas.height);
    const deltaTime = timestamep - lastTime;
    lastTime = timestamep;
    timeToNextRaven += deltaTime;
    drawScore();
    if (timeToNextRaven > ravenIntarval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        const newRav = new Raven();
        ravens.sort(function (a, b) {
            return a.width - b.width;
        });
    }
    [...Items, ...particles, ...ravens, ...explozers,].forEach((object) => {
        object.update(deltaTime);
    });
    [...Items, ...particles, ...ravens, ...explozers,].forEach((object) => {
        object.draw();
    });
    ravens = ravens.filter((raven) => !raven.markedForDeletion);
    explozers = explozers.filter((explozer) => !explozer.markedForDeletion);
    particles = particles.filter((particle) => !particle.markedTodeletion);
    Items = Items.filter((item) => !item.markedForDeletion);
    if (!gameOver)
        requestAnimationFrame(animate);
    if (gameOver)
        GAME_OVER();
}
animate(0);
function retry() {
    ctxS.restore();
    ravens = [];
    particles = [];
    explozers = [];
    Items = [];
    score = 0;
    drawScore();
    replayBtn.style.display = "none";
    music.src = "../assets/sounds/music.mp3";
    gameOver = false;
    animate(0);
}

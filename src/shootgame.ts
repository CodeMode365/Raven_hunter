//replay button
const replayBtn: HTMLDivElement = document.getElementById("replay")
replayBtn.style.display = "none"

replayBtn.onclick = () => {
    window.location.reload()
}




//main canavs
const canvas: HTMLCanvasElement = document.getElementById("shootGame")
const ctxS: CanvasRenderingContext2D = canvas.getContext("2d")

canvas.width = window.innerWidth
canvas.height = window.innerHeight

//canvas for detecting collition
const collisioncanvas: HTMLCanvasElement = document.getElementById("collisionCanvas")
const collisionCTX: CanvasRenderingContext2D = collisioncanvas.getContext("2d")

collisioncanvas.width = window.innerWidth
collisioncanvas.height = window.innerHeight

//if small screen or no?
const smallScreen = canvas.width <= 600 ? true : false

//incresing speed points
const speedIncreasingPoints = [50, 100, 170, 250, 345, 420, 500, 620, 720, 780, 830, 950, 1000]
const speedDecreadingPoints = [58, 115, 200, 280, 360, 450, 550, 690, 730, 800, 900, 980]
let increaseSpeed = false
/*incresing speed logic at some points */
function manageSpeed(): void {

    speedIncreasingPoints.forEach(incPoint => {
        if (score === incPoint) increaseSpeed = true
    })
    speedDecreadingPoints.forEach(dcrPoint => {
        if (score === dcrPoint) increaseSpeed = false
    })
}



//main game music
const music = new Audio()
music.src = "../assets/sounds/music.mp3"

function playMusic(): void {
    music.play()
    music.onended = () => {
        playMusic()
    }
}

//reavens
let timeToNextRaven: number = 0
let lastTime: number = 0
let score = 0
let ravenIntarval: number = 900;
//change raven interval with increaing score
const changeRvnInterval = () => {
    if (score <= 15) ravenIntarval = 750
    else if (score <= 30) ravenIntarval = 900
    else if (score <= 45) ravenIntarval = 850
    else if (score <= 60) ravenIntarval = 800
    else if (score <= 75) ravenIntarval = 750
    else if (score <= 90) ravenIntarval = 700
    else if (score <= 105) ravenIntarval = 650
    else if (score <= 120) ravenIntarval = 600
    else if (score <= 135) ravenIntarval = 550
    else if (score <= 150) ravenIntarval = 500
    else if (score <= 165) ravenIntarval = 450
    else if (score <= 180) ravenIntarval = 400
    else if (score <= 195) ravenIntarval = 350
    else if (score >= 210) ravenIntarval = 300

}
let gameOver: boolean = false
let overCount: number = 0


//all explosives
let explozers: Explosion[] = []
let highScore: number;
//setLocal storage value for hight score
if (localStorage.getItem("highScore")) {
    highScore = parseInt(localStorage.getItem("highScore"))

} else {
    localStorage.setItem("highScore", "0")
    highScore = 0
}

class Explosion {
    //setting up explosives value
    private spriteHeight = 179
    private spriteWidth = 200
    private explodeImage: HTMLImageElement = new Image()
    private explodeEffect: HTMLAudioElement = new Audio()
    private x: number
    private y: number
    private size: number
    private frame = 0
    private timeSinceLastFrame = 0
    private frameInterval = 100
    public markedForDeletion = false
    constructor(x: number, y: number, size: number) {
        this.x = x
        this.y = y
        this.explodeImage.src = "../assets/boom.png"
        this.explodeEffect.src = "../assets/sounds/gun.mp3"
        this.size = size
    }
    public update(deltaTime: number): void {
        if (this.frame === 0) this.explodeEffect.play()
        this.timeSinceLastFrame += deltaTime

        //increaing the frame picture slowly
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.frame++
            this.timeSinceLastFrame = 0
            if (this.frame > 5) { this.markedForDeletion = true }
        }

    }
    public draw(): void {
        ctxS.drawImage(this.explodeImage, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y - this.size / 4, this.size, this.size)
    }
}

//ravens
let ravens: Raven[] = []
class Raven {
    readonly width: number
    private height: number
    public x: number
    public y: number
    private directionX: number
    private directionY: number
    private creatureImage: HTMLImageElement = new Image()
    private spriteHeight: number
    private spriteWidth: number
    private sizeModifier: number
    private frame: number = 0
    private maxFrame: number = 4
    private timeSinceFlap: number
    private flapInterval: number
    readonly randmColor: number[]
    private GenColor: string
    public markedForDeletion: boolean
    private hasTrail: boolean
    constructor() {
        this.sizeModifier = Math.random() * 0.6 + 0.5
        this.spriteWidth = 271
        this.spriteHeight = 194
        this.width = this.spriteWidth / 2 * this.sizeModifier
        this.height = this.spriteHeight / 2 * this.sizeModifier
        this.x = canvas.width
        this.y = Math.random() * (canvas.height - this.height)

        //for new creature in incresing score
        if (increaseSpeed) {
            this.creatureImage.src = "../assets/Boss2.png"
            if (smallScreen) {
                this.directionX = Math.random() * 3 + 3
            }
            else {
                this.directionX = Math.random() * 5.5 + 7
            }
        } else {
            this.creatureImage.src = "../assets/raven.png"
            if (smallScreen) {
                this.directionX = Math.random() * 2 + 1
            } else {
                this.directionX = Math.random() * 4 + 3
            }
        }


        this.directionY = Math.random() * 5 - 2.5
        this.markedForDeletion = false
        // this.creatureImage.src = "../assets/raven.png"
        this.timeSinceFlap = 0
        this.flapInterval = Math.random() * 50 + 50
        this.randmColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.GenColor = `rgba(${this.randmColor[0]},${this.randmColor[1]},${this.randmColor[2]})`
        this.hasTrail = Math.random() < .25
    }
    public update(deltaTime: number): void {
        this.x -= this.directionX
        this.y += this.directionY



        if (this.y < 0 || this.y > canvas.height - this.height) {
            this.directionY = this.directionY * -1
        }
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
            //to load flapping frame
            if (this.frame > this.maxFrame) {
                this.frame = 0
            } else {
                this.frame++
            }
            this.timeSinceFlap = 0
            if (this.hasTrail) {
                if (score > 40) {
                    particles.push(new Particle(this.x, this.y, this.width, this.GenColor))
                }
            }
        }
        //to remove the raven that passed screen
        if (this.x < 0 - this.width) {
            this.markedForDeletion = true
        }
        if (this.x < 0 - this.width) gameOver = true
    }
    //draw the raven
    public draw(): void {
        collisionCTX.fillStyle = this.GenColor
        collisionCTX.fillRect(this.x, this.y, this.width, this.height)
        ctxS.drawImage(this.creatureImage, this.frame * this.spriteWidth, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
    }

}


//particel class
let particles: Particle[] = []


class Particle {
    private x: number
    private y: number
    private radius: number
    private speedX: number
    private maxRadius: number
    private size: number
    private color: string
    public markedTodeletion: boolean
    // private radius: number
    constructor(x: number, y: number, size: number, color: string) {
        this.size = size
        this.x = x + this.size / 2 + Math.random() * 50 - 25
        this.y = y + this.size / 3 + Math.random() * 50 - 25
        this.radius = Math.random() * this.size / 10
        this.maxRadius = Math.random() * 20 + 35
        this.speedX = Math.random() * 1 + 0.5
        this.color = color
        this.markedTodeletion = false
        // this.radius
    }
    public update(): void {
        this.x += this.speedX
        this.radius += Math.random() * 0.5
        if (this.radius > this.maxRadius - 5) this.markedTodeletion = true
    }
    public draw(): void {
        ctxS.save()
        ctxS.globalAlpha = 1 - this.radius / this.maxRadius
        ctxS.beginPath()
        ctxS.fillStyle = this.color
        ctxS.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctxS.fill()
        ctxS.restore()
    }
}

//scoring
function drawScore(): void {


    //score
    ctxS.font = "30px Impact"
    ctxS.fillStyle = "black";
    ctxS.fillText("Score: " + score, 52, 75)
    ctxS.fillStyle = "white"
    ctxS.fillText("Score: " + score, 53, 76)
    ctxS.fillStyle = "black"
    ctxS.fillText("Score: " + score, 54, 76)
    ctxS.fillStyle = "black"
    //highScore
    ctxS.font = "25px Impact"
    ctxS.fillText("High Score: " + highScore, 52, 136 - 30)
    ctxS.fillStyle = "white"
    ctxS.fillText("High Score: " + highScore, 53, 136 - 30)
    ctxS.fillStyle = "black"
    ctxS.fillText("High Score: " + highScore, 54, 136 - 30)
}


//gameOVer function
function GAME_OVER(): void {


    replayBtn.style.display = "block"
    ctxS.textAlign = "center"
    ctxS.font = "30px Impact"
    ctxS.fillStyle = "black"
    ctxS.fillText("GAME OVER", canvas.width / 2 - 4, canvas.height / 2 - 4)
    ctxS.fillStyle = "white"
    ctxS.fillText("GAME OVER", canvas.width / 2 - 2, canvas.height / 2 - 2)
    ctxS.fillStyle = "rgb(230,120,60)"
    ctxS.fillText("GAME OVER", canvas.width / 2, canvas.height / 2)
    ctxS.fillStyle = "black"
    ctxS.font = "35px Impact"
    ctxS.fillText("Your Score is: " + score, canvas.width / 2 - 4, canvas.height / 2 + 80 - 4 - 30)
    ctxS.fillStyle = "white"
    ctxS.fillText("Your Score is: " + score, canvas.width / 2 - 2, canvas.height / 2 + 80 - 2 - 30)
    ctxS.fillStyle = "rgb(64,134,74)"
    ctxS.fillText("Your Score is: " + score, canvas.width / 2, canvas.height / 2 + 80 - 30)

    if (score >= highScore) {
        music.src = "../assets/sounds/walk.mp3"
        music.play()
        ctxS.textAlign = "center"
        ctxS.font = "25px Impact"
        ctxS.fillStyle = "black"
        ctxS.fillText("Ya woo you got high Score 🥳🥳", canvas.width / 2 - 4 + 30, canvas.height / 2 + 80 - 4)
        ctxS.fillStyle = "white"
        ctxS.fillText("Ya woo you got high Score 🥳🥳", canvas.width / 2 - 2 + 30, canvas.height / 2 + 80 - 2)
        ctxS.fillStyle = "red"
        ctxS.fillText("Ya woo you got high Score 🥳🥳", canvas.width / 2 + 30, canvas.height / 2 + 80)
        localStorage.setItem("highScore", score.toLocaleString())
    } else {
        music.src = "../assets/sounds/crow.wav"
        music.play()

    }
}

//clicking event
window.addEventListener("click", (e: MouseEvent) => {
    playMusic()
    const deltectPixelColor = collisionCTX.getImageData(e.x, e.y, 1, 1)
    //to hold pixels color
    const pc = deltectPixelColor.data

    ravens.forEach((raven: Raven): void => {
        if (raven.randmColor[0] == Math.floor(pc[0]) && raven.randmColor[1] == Math.floor(pc[1]) && raven.randmColor[2] == Math.floor(pc[2])) {
            raven.markedForDeletion = true
            score++
            explozers.push(new Explosion(raven.x, raven.y, raven.width))
        }
    })
    if (score > highScore) highScore = score
})

//to run the animation
function animate(timestamep: number): void {
    if (score < 220) changeRvnInterval();
    ctxS.clearRect(0, 0, canvas.width, canvas.height)
    collisionCTX.clearRect(0, 0, canvas.width, canvas.height)
    const deltaTime = timestamep - lastTime
    lastTime = timestamep
    timeToNextRaven += deltaTime
    drawScore()
    if (timeToNextRaven > ravenIntarval) {

        ravens.push(new Raven())
        timeToNextRaven = 0
        const newRav = new Raven()
        ravens.sort(function (a, b) {
            return a.width - b.width;
        })
    }

    [...particles, ...ravens, ...explozers].forEach((object: (Raven | Explosion | Particle)): void => {
        object.update(deltaTime)
    });
    [...particles, ...ravens, ...explozers].forEach((object: (Raven | Explosion | Particle)): void => {
        object.draw()
    });
    manageSpeed()
    ravens = ravens.filter((raven: Raven) => !raven.markedForDeletion)
    explozers = explozers.filter((explozer: Explosion) => !explozer.markedForDeletion)
    particles = particles.filter((particle: Particle) => !particle.markedTodeletion)
    if (!gameOver) requestAnimationFrame(animate)
    if (gameOver) GAME_OVER()
}

animate(0)

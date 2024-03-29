//replay button
const replayBtn: HTMLDivElement = document.getElementById("replay")
replayBtn.style.display = "none"

replayBtn.onclick = () => {
    // window.location.reload()
    retry()
}
//main canavs
const canvas: HTMLCanvasElement = document.getElementById("shootGame")
const ctxS: CanvasRenderingContext2D = canvas.getContext("2d", { willReadFrequently: true })

canvas.width = window.innerWidth
canvas.height = window.innerHeight

//canvas for detecting collition
const collisioncanvas: HTMLCanvasElement = document.getElementById("collisionCanvas")
const collisionCTX: CanvasRenderingContext2D = collisioncanvas.getContext("2d", { willReadFrequently: true })

collisioncanvas.width = window.innerWidth
collisioncanvas.height = window.innerHeight

//if small screen or no?
const smallScreen = canvas.width <= 600 ? true : false

//incresing speed points


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
let ravenIntarval: number = 2000;
//change raven interval with increaing score
const changeRvnInterval = () => {
    if (score <= 15) ravenIntarval = 2000
    else if (score <= 30) ravenIntarval = 1500
    else if (score <= 45) ravenIntarval = 1000
    else if (score <= 60) ravenIntarval = 800
    else if (score <= 75) ravenIntarval = 750
    else if (score <= 90) ravenIntarval = 700
    else if (score <= 105) ravenIntarval = 650
    else if (score <= 120) ravenIntarval = 600
    else if (score <= 135) ravenIntarval = 550
    else if (score <= 150) ravenIntarval = 500
    else if (score >= 150) ravenIntarval = 400
}

let gameOver: boolean = false
let overCount: number = 0
let power = 0


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

let Items: Item[] = []

class Item {
    private spriteWidth = 150
    private spriteHeight = 150
    private itemImage: HTMLImageElement = new Image()
    // private itemEffect: HTMLAudioElement = new Audio()
    readonly x: number
    public y: number
    // private frame = 1
    private timeSinceLastFrame = 0
    private frameInterval = 100
    public markedForDeletion = false
    readonly width = this.spriteWidth / 3
    readonly height = this.spriteHeight / 3
    private angle = 0
    constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.itemImage.src = "../assets/booster.png"
        // this.itemEffect.src = "../assets/sounds/coins.wav"
        // this.itemEffect.play()
        // this.size = size
    }
    public update(deltaTime: number): void {
        this.angle += .5

        this.timeSinceLastFrame += deltaTime

        // shaking the item slowly
        if (this.timeSinceLastFrame > this.frameInterval) {
            this.timeSinceLastFrame = 0
            this.y += Math.sin(this.angle) * 5
        }
    }
    public draw(): void {
        ctxS.fillStyle = "black"
        // ctxS.strokeRect(this.x, this.y, this.width, this.height)
        ctxS.drawImage(this.itemImage, 0, 0, this.spriteWidth, this.spriteHeight, this.x, this.y, this.width, this.height)
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
    private speedModifier: number = 4
    private speedAdditional = 3
    constructor() {
        this.sizeModifier = Math.random() * 0.6 + 0.5
        this.spriteWidth = 271
        this.spriteHeight = 194
        this.width = this.spriteWidth / 2 * this.sizeModifier
        this.height = this.spriteHeight / 2 * this.sizeModifier
        this.x = canvas.width
        this.y = Math.random() * (canvas.height - this.height)
        // this.speedModifier = smallScreen ? 2 : 4

        //for new creature in incresing score

        this.creatureImage.src = "../assets/blue_raven.png"
        this.incSpeed()
        this.directionX = Math.random() * this.speedModifier + this.speedAdditional


        this.directionY = Math.random() * 5 - 2.5
        this.markedForDeletion = false
        // this.creatureImage.src = "../assets/raven.png"
        this.timeSinceFlap = 0
        this.flapInterval = Math.random() * 50 + 50
        this.randmColor = [Math.floor(Math.random() * 255), Math.floor(Math.random() * 255), Math.floor(Math.random() * 255)]
        this.GenColor = `rgba(${this.randmColor[0]},${this.randmColor[1]},${this.randmColor[2]})`
        this.hasTrail = Math.random() < .5
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
                if (score > 40 && particles.length <= 30) {
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

    incSpeed() {
        //change the speed of new raven
        switch (true) {
            case score <= 20:
                this.speedModifier = 3
                this.speedAdditional = 3
                break;
            case score <= 35:
                this.speedModifier = 3.5
                this.speedAdditional = 3
                break;
            case score <= 55:
                this.sizeModifier = 4
                this.speedAdditional = 4
                break;
            case score <= 75:
                this.speedModifier = 4.5
                this.speedAdditional = 4
                break;
            case score <= 90:
                this.speedModifier = 4.5
                this.speedAdditional = 4.5
                break;
            case score <= 110:
                this.speedModifier = 5
                this.speedAdditional = 4.5
                break;
            case score <= 130:
                this.speedModifier = 5.5
                this.speedAdditional = 5
                break;
            case score <= 145:
                this.speedModifier = 5.5
                this.speedAdditional = 6
                break;
            case score <= 160:
                this.speedModifier = 6.5
                this.speedAdditional = 6
                break;
            case score <= 190:
                this.speedModifier = 7
                this.speedAdditional = 6.5
                break;
            case score <= 210:
                this.speedModifier = 6.5
                this.speedAdditional = 7
                break;
            case score < 235:
                this.speedModifier = 7.5
                this.speedAdditional = 7.5
                break;
            case score >= 235:
                this.speedModifier = 8
                this.speedAdditional = 8
                break
            case score >= 280:
                this.speedModifier = 8.5
                this.speedAdditional = 8.5
                break
            case score >= 330:
                this.speedModifier = 9
                this.speedAdditional = 9
                break
            case score >= 380:
                this.speedModifier = 10
                this.speedAdditional = 10
                break
            default:
                this.speedModifier = 12
                this.speedAdditional = 12

        }


        //change the image on new ravens
        if (score <= 50) {
            this.creatureImage.src = "../assets/raven.png"
        }
        else if (score <= 150) {
            this.creatureImage.src = "../assets/pink_raven.png"
        }
        else if (score <= 250) {
            this.creatureImage.src = "../assets/blue_raven.png"
        }
        else if (score <= 350) {
            this.creatureImage.src = "../assets/purple_raven.png"
        }
        else if (score <= 450) {
            this.creatureImage.src = "../assets/yellow_raven.png"
        }
        else if (score <= 550) {
            this.creatureImage.src = "../assets/green_raven.png"
        }
        else if (score <= 650) {
            this.creatureImage.src = "../assets/Boss2.png"
        } else {
            this.creatureImage.src = "../assets/red_raven.png"
        }

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
    ctxS.fillText("Score: " + score, canvas.width / 2, 78)
    ctxS.fillStyle = "white"
    ctxS.fillText("Score: " + score, canvas.width / 2 + 1, 79)
    ctxS.fillStyle = "black"
    ctxS.fillText("Score: " + score, canvas.width / 2 + 2, 79)
    ctxS.fillStyle = "black"

    //show powers
    ctxS.font = "25px Impact"
    ctxS.fillText("Power: " + power, canvas.width / 2, 45)
    ctxS.fillStyle = "white"
    ctxS.fillText("Power: " + power, canvas.width / 2 + 1, 46)
    ctxS.fillStyle = "green"
    ctxS.fillText("Power: " + power, canvas.width / 2 + 2, 47)
    ctxS.fillStyle = "black"
    //highScore
    ctxS.font = "25px Impact"
    ctxS.fillText("High Score: " + highScore, canvas.width / 2, 136 - 25)
    ctxS.fillStyle = "white"
    ctxS.fillText("High Score: " + highScore, canvas.width / 2 + 1, 136 - 25)
    ctxS.fillStyle = "black"
    ctxS.fillText("High Score: " + highScore, canvas.width / 2 + 2, 136 - 25)
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
            if (Math.random() * 6 > .1) {
                explozers.push(new Explosion(raven.x, raven.y, raven.width))
            } else {
                //draw booster here
                explozers.push(new Explosion(raven.x, raven.y, raven.width))
                Items.push(new Item(raven.x, raven.y))
            }
        }
    })
    if (score > highScore) highScore = score

    Items.forEach((item: Item) => {
        const getItem = new Audio()
        getItem.src = "../assets/sounds/getItem.wav"
        if ((e.offsetX > item.x) &&
            (e.offsetX < item.x + item.width) &&
            (e.offsetY > item.y) &&
            (e.offsetY < item.y + item.height)) {
            getItem.play()
            power++
            item.markedForDeletion = true
        }
    })
})
//using the power
window.addEventListener('keypress', (e: KeyboardEvent) => {
    if (e.key === " " && ravens.length !== 0 && power > 0) {
        power--
        ravens.forEach((raven: Raven) => {
            explozers.push(new Explosion(raven.x, raven.y, raven.width))
            score++
            raven.markedForDeletion = true
        });
    }
})



//to run the animation
function animate(timestamep: number): void {
    changeRvnInterval();
    ctxS.clearRect(0, 0, canvas.width, canvas.height)
    collisionCTX.clearRect(0, 0, canvas.width, canvas.height)
    const deltaTime = timestamep - lastTime
    lastTime = timestamep
    timeToNextRaven += deltaTime
    drawScore()
    if (timeToNextRaven > ravenIntarval && ravens.length <= 35) {
        ravens.push(new Raven())
        timeToNextRaven = 0
        const newRav = new Raven()
        ravens.sort(function (a, b) {
            return a.width - b.width;
        })
    }

    [...Items, ...particles, ...ravens, ...explozers,].forEach((object: (Raven | Explosion | Particle | Item)): void => {
        object.update(deltaTime)
    });
    [...Items, ...particles, ...ravens, ...explozers,].forEach((object: (Raven | Explosion | Particle | Item)): void => {
        object.draw()
    });
    // manageSpeed()
    ravens = ravens.filter((raven: Raven) => !raven.markedForDeletion)
    explozers = explozers.filter((explozer: Explosion) => !explozer.markedForDeletion)
    particles = particles.filter((particle: Particle) => !particle.markedTodeletion)
    Items = Items.filter((item: Item) => !item.markedForDeletion)
    // particles = particles.filter((particle: Particle) => !particle.markedTodeletion)
    if (!gameOver) requestAnimationFrame(animate)
    if (gameOver) GAME_OVER()
}

animate(0)


//retry function
function retry(): void {
    ctxS.restore()
    ravens = []
    particles = []
    explozers = []
    Items = []
    score = 0
    // drawScore(66+100, 67+100, 68+100)
    replayBtn.style.display = "none"
    music.src = "../assets/sounds/music.mp3"
    gameOver = false
    power = 0
    animate(0)
    // location.reload()
}
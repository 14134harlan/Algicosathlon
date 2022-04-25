const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
const squareSize = 10
const outline = 0
class Circle{
    constructor(x,y,radius,color,speedX,speedY,borders,mass,gravity=false){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.borders = borders
        this.gravity = gravity
        this.speedX = speedX
        this.speedY = speedY
        this.time = 0
        this.restitution = 0.9
        this.mass = mass
    }
    draw(){
        this.time += 1/60000
        if (this.gravity == true){
            const g = 9.81
            this.speedY += g*this.time
            this.x += this.speedX
            this.y += this.speedY
            this.speedX *= 0.995
        }
        else{
            this.x += this.speedX
            this.y += this.speedY
        }
        if(this.x-this.radius<this.borders[0]){
            this.speedX = Math.abs(this.speedX)*this.restitution
            this.x = this.borders[0]+this.radius
        }
        if(this.x+this.radius>this.borders[1]){
            this.speedX = -Math.abs(this.speedX)*this.restitution
            this.x = this.borders[1]-this.radius
        }
        if(this.y-this.radius<this.borders[2]){
            this.speedY = Math.abs(this.speedY)*this.restitution
            this.y = this.borders[2]+this.radius
        }
        if(this.y+this.radius>this.borders[3]){
            this.speedY = -Math.abs(this.speedY)*this.restitution
            this.y = this.borders[3]-this.radius
        }
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.radius,0,Math.PI*2,false)
        ctx.fill()
    }
    detectCollision(circle){
        const {speedX:speedX, speedY:speedY, x:x, y:y, radius:radius} = circle
        const collisionDist = this.radius+radius
        const x_dist = x-this.x
        const y_dist = y-this.y
        const dist = Math.sqrt(Math.pow(x_dist,2)+Math.pow(y_dist,2))
        if(dist<collisionDist){
            const directionX = x_dist/dist
            const directionY = y_dist/dist
            const velocityX = this.speedX-speedX
            const velocityY = this.speedY-speedY
            const speed = velocityX*directionX+velocityY*directionY*this.restitution
            const impulse = 2*speed/(this.mass+circle.mass)
            if (this.speedX != 0 || this.speedY != 0){
                this.speedX -= impulse*circle.mass*directionX
                this.speedY -= impulse*circle.mass*directionY
            }
            if (circle.speedX != 0 || circle.speedY != 0){
                circle.speedX += impulse*this.mass*directionX
                circle.speedY += impulse*this.mass*directionY
            }
            const dif = dist-collisionDist
            if (this.speedX != 0 || this.speedY != 0){
                this.x += directionX*dif/2
                this.y += directionY*dif/2
            }
            if (circle.speedX != 0 || circle.speedY != 0){
                circle.x -= directionX*dif/2
                circle.y -= directionY*dif/2
            }
        }
    }
}
class Marble{
    constructor(x,y,speedX,speedY,size,color,color2,name){
        this.x = x
        this.y = y
        this.speedX = speedX
        this.speedY = speedY
        this.color = color
        this.size = size
        this.color2 = color2
        this.mass = 7.5+Math.sqrt(Math.sqrt(Math.pow(size,1.5)))
        this.name = name
    }
    draw(){
        this.x += this.speedX
        this.y += this.speedY
        if(this.x-this.mass<300){
            this.speedX = Math.abs(this.speedX)
            this.x = 300+this.mass
        }
        if(this.x+this.mass>1100){
            this.speedX = -Math.abs(this.speedX)
            this.x = 1100-this.mass
        }
        if(this.y-this.mass<0){
            this.speedY = Math.abs(this.speedY)
            this.y = this.mass
        }
        if(this.y+this.mass>800){
            this.speedY = -Math.abs(this.speedY)
            this.y = 800-this.mass
        }
        ctx.fillStyle = this.color
        ctx.beginPath()
        ctx.arc(this.x,this.y,this.mass,0,Math.PI*2,false)
        ctx.fill()
        ctx.fillStyle = '#000000'
        const width = ctx.measureText(this.size).width
        ctx.fillText(this.size,this.x-width/2,this.y+8)
        for (let i=0; i<towers.length; i++){
            for (let k=0; k<towers[i].marbles.length; k++){
                if (towers[i].marbles[k] != this){
                    this.detectCollision(towers[i].marbles[k])
                }
            }
        }
        ctx.font = '24px Arial'
        let out = this.detectSquareCollision()
        this.detectTowerCollision()
        return out
    }
    detectCollision(m){
        const x_dist = m.x-this.x
        const y_dist = m.y-this.y
        const collisionDist = m.mass+this.mass
        const dist = Math.sqrt(Math.pow(x_dist,2)+Math.pow(y_dist,2))
        if(dist<=collisionDist){
            const directionX = x_dist/dist
            const directionY = y_dist/dist
            const velocityX = this.speedX-m.speedX
            const velocityY = this.speedY-m.speedY
            const speed = velocityX*directionX+velocityY*directionY
            const impulse = 2*speed/(this.size+m.size)
            this.speedX -= impulse*m.size*directionX
            this.speedY -= impulse*m.size*directionY
            m.speedX += impulse*this.size*directionX
            m.speedY += impulse*this.size*directionY
            this.x += this.speedX
            this.y += this.speedY
            m.x += m.speedX
            m.y += m.speedY
        }
    }
    detectSquareCollision(){
        let collidedSquares = squares.filter(s => s.color != this.color2 && this.x-this.mass<=s.x+squareSize-1 && this.x+this.mass>=s.x && this.y-this.mass<=s.y+squareSize-1 && this.y+this.mass>=s.y)
        for (let i=0; i<collidedSquares.length; i++){
            if(this.size>0){
                collidedSquares[i].color = this.color2
                this.size -= 1
                this.mass = 7.5+Math.sqrt(Math.sqrt(Math.pow(this.size,1.5)))
                if (this.size==0){
                    return true
                }
            }
            else{
                return true
            }
        }
    }
    detectTowerCollision(){
        for (let i=0; i<towers.length; i++){
            if(towers[i].color2 != this.color2){
                let towerMass = 9+Math.sqrt(Math.sqrt(Math.pow(towers[i].size,1.5)))
                const collisionDist = this.mass+towerMass
                const x_dist = towers[i].x-this.x
                const y_dist = towers[i].y-this.y
                const dist = Math.sqrt(Math.pow(x_dist,2)+Math.pow(y_dist,2))
                if(dist<=collisionDist){
                    let mSize = this.size
                    this.size -= towers[i].size
                    if(this.size<0){
                        this.size=0
                    }
                    towers[i].size -= mSize
                    if(towers[i].size<0){
                        eliminations.push(new Elimination(droppers[i]))
                        towers.splice(i,1)
                        droppers.splice(i,1)
                    }
                }
            }
        }
    }
}
class Tower{
    constructor(x,y,color,angle1,angle2,color2,name){
        this.x = x
        this.y = y
        this.color = color
        this.size = 1
        this.angle = angle1
        this.minAngle = angle1-Math.PI/10
        this.maxAngle = angle2+Math.PI/10
        this.clockwise = true
        this.marbles = []
        this.color2 = color2
        this.name = name
    }
    draw(){
        if(this.clockwise==true){
            this.angle += Math.PI/500
            if(this.angle>=this.maxAngle){
                this.clockwise=false
            }
        }
        else{
            this.angle -= Math.PI/500
            if(this.angle<=this.minAngle){
                this.clockwise=true
            }
        }
        ctx.beginPath()
        ctx.fillStyle=this.color
        ctx.arc(this.x,this.y,9+Math.sqrt(Math.sqrt(Math.pow(this.size,1.5))),0,Math.PI*2,false)
        ctx.fill()
        const x = Math.cos(this.angle)*(40+Math.sqrt(Math.sqrt(Math.pow(this.size,1.75))))
        const y = Math.sin(this.angle)*(40+Math.sqrt(Math.sqrt(Math.pow(this.size,1.75))))
        ctx.strokeStyle = this.color
        ctx.beginPath()
        ctx.moveTo(this.x,this.y)
        ctx.lineTo(this.x+x,this.y+y)
        ctx.lineWidth = 10+Math.sqrt(Math.sqrt(Math.pow(this.size,1.25)))
        ctx.stroke()
        ctx.fillStyle = '#000000'
        const width = ctx.measureText(this.size).width
        ctx.fillText(this.size,this.x-width/2,this.y+8)
        ctx.strokeStyle = '#000000'
        for (let i=0; i<this.marbles.length; i++){
            const out = this.marbles[i].draw()
            if (out == true){
                this.marbles.splice(i,1)
            }
        }
    }
    release(){
        const x = Math.cos(this.angle)*40
        const y = Math.sin(this.angle)*40
        let sub = Math.sqrt(Math.sqrt(Math.sqrt(this.size)))
        const speedX = Math.cos(this.angle)*5/sub
        const speedY = Math.sin(this.angle)*5/sub
        this.marbles.push(new Marble(this.x+x,this.y+y,speedX,speedY,this.size,this.color,this.color2,this.name))
    }
}
class Elimination{
    constructor(dropper){
        this.y = dropper.y+212
        this.name = dropper.tower.name.toUpperCase()
        this.color = dropper.color
        this.time = 300
        this.color2 = dropper.tower.color2
        ctx.font = '36px Arial'
        const width = ctx.measureText('ELIMINATED!').width
        this.x = dropper.x+150-width/2
    }
    draw(){
        ctx.fillStyle = this.color2
        ctx.font = '36px Arial'
        ctx.fillText('ELIMINATED!',this.x,this.y)
        if(this.time>0){
            this.time -= 1
            ctx.font = '48px Arial'
            ctx.fillStyle = this.color
            const txt = this.name+' HAS BEEN ELIMINATED!'
            const width = ctx.measureText(txt).width
            ctx.fillText(txt,700-width/2,416)
        }
    }
}
class Obstacle extends Circle{
    constructor(x,y,radius=15,color='#000000',speedX=0,speedY=0,borders=[0,1400,0,800],mass=1000000000,gravity=false){
        super(x,y,radius,color,speedX,speedY,borders,mass,gravity)
    }
}
class MarbleDrop{
    constructor(x,y,color,tower){
        this.x = x
        this.y = y
        this.marbleCount = 1
        this.color = color
        this.marbles = []
        this.tower = tower
        this.obstacles = []
        this.additionalChance = 0
        setInterval(() => {
            if(this.marbleCount>=3 && ctx.measureText('Release').width<145-this.additionalChance){
                this.additionalChance += 0.1
            }
        },1000)
        for (let i=0; i<3; i++){
            for (let p=0; p<4; p++){
                this.obstacles.push(new Obstacle(this.x+50+p*65,this.y+75+i*115))
            }
        }
        for (let i=0; i<2; i++){
            for (let p=0; p<5; p++){
                this.obstacles.push(new Obstacle(this.x+15+65*p,this.y+132.5+i*115))
            }
        }
        setInterval(() => {
            this.marbleCount += 1
        },60000)
    }
    draw(){
        if(this.marbles.length<this.marbleCount){
            this.marbles.push(new Circle(this.x+145,this.y+15,10,this.color,Math.random()*4-2,0,[this.x+5,this.x+285,this.y,this.y+400],1,true))
        }
        for (let i=0; i<this.marbles.length; i++){
            this.marbles[i].draw()
            for (let k=0; k<this.marbles.length; k++){
                if (this.marbles[i] != this.marbles[k]){
                    this.marbles[i].detectCollision(this.marbles[k])
                }
            }
            for (let p=0; p<this.obstacles.length; p++){
                this.marbles[i].detectCollision(this.obstacles[p])
            }
            if(this.marbles[i].y+10>=this.y+380){
                if (this.marbles[i].x<=this.x+145+this.additionalChance && this.tower.size<1000000){
                    this.tower.size *= 2
                }
                else{
                    this.tower.release()
                    this.tower.size = 1
                }
                this.marbles.splice(i,1)
            }
        }
        for (let i=0; i<this.obstacles.length; i++){
            this.obstacles[i].draw()
        }
        ctx.fillStyle = '#00ff00'
        ctx.fillRect(this.x,this.y+380,145+this.additionalChance,20)
        ctx.fillStyle = '#ff0000'
        ctx.fillRect(this.x+145+this.additionalChance,this.y+380,145-this.additionalChance,20)
        ctx.fillStyle = '#000000'
        ctx.font = '24px Arial'
        ctx.fillText('x2',this.x+65+this.additionalChance/2,this.y+398)
        ctx.fillText('Release',this.x+175+this.additionalChance/2,this.y+398)
        ctx.beginPath()
        ctx.moveTo(this.x,this.y+2.5)
        ctx.lineTo(this.x+287.5,this.y+2.5)
        ctx.lineTo(this.x+287.5,this.y+402.5)
        ctx.lineTo(this.x+2.5,this.y+402.5)
        ctx.lineTo(this.x+2.5,this.y+2.5)
        ctx.lineWidth = 5
        ctx.stroke()
    }
}
class Square{
    constructor(x,y,color){
        this.x = x
        this.y = y
        this.color = color
    }
    draw(){
        ctx.fillStyle = this.color
        ctx.fillRect(this.x,this.y,squareSize-outline,squareSize-outline)
    }
}
const squares = []
for (let i=0; i<400/squareSize; i++){
    for (let k=0; k<400/squareSize; k++){
        squares.push(new Square(300+k*squareSize,i*squareSize,'#00ff00'))
        squares.push(new Square(700+k*squareSize,i*squareSize,'#ff0000'))
        squares.push(new Square(300+k*squareSize,400+i*squareSize,'#0000ff'))
        squares.push(new Square(700+k*squareSize,400+i*squareSize,'#ffff00'))
    }
}
let time = 0 
const eliminations = []
const towers = [new Tower(340,40,'#007d00',0,Math.PI/2,'#00ff00','Green'),new Tower(340,760,'#00007d',Math.PI*1.5,Math.PI*2,'#0000ff','Blue'),
new Tower(1060,40,'#7d0000',Math.PI/2,Math.PI,'#ff0000','Red'),new Tower(1060,760,'#7d7d00',Math.PI,Math.PI*1.5,'#ffff00','Yellow')]
const droppers = [new MarbleDrop(0,0,'#007d00',towers[0]), new MarbleDrop(0,400,'#00007d',towers[1]),
new MarbleDrop(1110,0,'#7d0000',towers[2]),new MarbleDrop(1110,400,'#7d7d00',towers[3])]
function mainLoop(){
    time += 1
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0,0,1400,800)
    ctx.fillStyle = '#000000'
    ctx.fillRect(285,0,830,800)
    for (let i=0; i<droppers.length; i++){
        droppers[i].draw()
    }
    for (let i=0; i<squares.length; i++){
        squares[i].draw()
    }
    for (let i=0; i<towers.length; i++){
        towers[i].draw()
    }
    for (let i=0; i<eliminations.length; i++){
        eliminations[i].draw()
    }
    if(towers.length == 1 && eliminations.find(e => e.time>0)==undefined){
        ctx.font = '48px Arial'
        ctx.fillStyle = '#000000'
        const txt = towers[0].name.toUpperCase()+' WINS!'
        const width = ctx.measureText(txt).width
        ctx.fillText(txt,800-width/2,416)
    }
    requestAnimationFrame(mainLoop)
}
mainLoop()
setInterval(() => {
    console.log('FPS -- '+time)
    time = 0
},1000)
setInterval(() => {
    if(towers.length==1){
        if(droppers[0].marbleCount>25){
            droppers[0].marbleCount = 25
        }
        if(towers[0].marbles.length>50){
            for (let i=0; i<towers[0].marbles.length-50; i++){
                const list = []
                for (let k=0; k<towers[0].marbles.length; k++){
                    list.push(towers[0].marbles[k].size)
                }
                const minSize = Math.min(...list)
                const index = towers[0].marbles.indexOf(m => m.size == minSize)
                towers[0].marbles.splice(index,1)
            }
        }
    }
},60000)

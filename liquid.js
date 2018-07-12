var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

var squareSize = 20
var squarePadding = 5

var maxPointsPerSquare = 30

var squaresPerMilli = 0.01
var maxSpeed = 10

var speedDecay = 0.995

var sidePush = 0.5

var width = 5
var height = 5

/*
Each point is an array:
[
x, -X Position
y, -Y Position
vX, -X velocity
vY  -Y velocity
]
*/
var points = []
var squares = []

var lastFrameTime = Date.now()

var globalDirection = [0, 0]
var directionSource = 'random'
var maxDirectionSpeed = 0.2

function setup() {
    width = Math.ceil(window.innerWidth / squareSize)
    height = Math.ceil(window.innerHeight / squareSize)

    canvas.width = width * squareSize
    canvas.height = height * squareSize

    canvas.style.left =
        ((window.innerWidth - canvas.width) / 2).toString() + 'px'
    canvas.style.top =
        ((window.innerHeight - canvas.height) / 2).toString() + 'px'

    var pointCount = width * height * 2

    points = []

    squares = []

    for (var x = 0; x < width; x++) {
        squares.push([])
        for (var y = 0; y < height; y++) {
            squares[x].push(0)
        }
    }

    for (var i = 0; i < pointCount; i++) {
        points.push([
            Math.random() * (width - 1),
            Math.random() * (height - 1),
            Math.random() - 0.5,
            Math.random() - 0.5
        ])
    }

    updateSquares()
}

function updateSquares() {
    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            squares[x][y] = 0
        }
    }

    for (var i = 0; i < points.length; i++) {
        squares[~~(points[i][0] + 0.5)][~~(points[i][1] + 0.5)] += 1
    }
}

function drawAndUpdate() {
    var frameTime = Date.now()
    frameTime -= lastFrameTime

    lastFrameTime = frameTime + lastFrameTime

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (directionSource === 'random') {
        globalDirection[0] += (Math.random() - 0.5) * 0.01
        globalDirection[1] += (Math.random() - 0.5) * 0.01
    }
    globalDirection[0] = Math.max(
        -maxDirectionSpeed,
        Math.min(maxDirectionSpeed, globalDirection[0])
    )
    globalDirection[1] = Math.max(
        -maxDirectionSpeed,
        Math.min(maxDirectionSpeed, globalDirection[1])
    )

    var newSquares = []

    for (var x = 0; x < width; x++) {
        newSquares.push([])

        for (var y = 0; y < height; y++) {
            var strength = squares[x][y] / maxPointsPerSquare
            ctx.globalAlpha = Math.max(0.1, strength)
            ctx.fillStyle =
                'hsl(200,' +
                (strength * 100).toString() +
                '%,' +
                (strength * 70 + 30).toString() +
                '%)'

            ctx.fillRect(
                x * squareSize + squarePadding / 2,
                y * squareSize + squarePadding / 2,
                squareSize - squarePadding,
                squareSize - squarePadding
            )

            newSquares[x].push(0)
        }
    }

    for (var i = 0; i < points.length; i++) {
        var x = ~~(points[i][0] + 0.5)
        var y = ~~(points[i][1] + 0.5)

        var velChange = [0, 0]
        //If the point is on the left or right edge, move move away
        //otherwise, push away dependant on how many points are in the square to the left/right
        if (x > 0) {
            velChange[0] += squares[x - 1][y] / maxPointsPerSquare
        } else {
            velChange[0] += sidePush
        }
        if (x < width - 1) {
            velChange[0] -= squares[x + 1][y] / maxPointsPerSquare
        } else {
            velChange[0] -= sidePush
        }
        //Do the same but for above/below
        velChange[1] += y === 0 ? 0.5 : squares[x][y - 1] / maxPointsPerSquare
        velChange[1] -=
            y === height - 1 ? 0.5 : squares[x][y + 1] / maxPointsPerSquare

        /*
    //Move away from squares on the diagonal
    if (x > 0 && y > 0) {
      velChange[0] += (squares[x - 1][y - 1] / maxPointsPerSquare) / 1.5
      velChange[1] += (squares[x - 1][y - 1] / maxPointsPerSquare) / 1.5
    }
    if (x < width - 1 && y > 0) {
      velChange[0] -= (squares[x + 1][y - 1] / maxPointsPerSquare) / 1.5
      velChange[1] += (squares[x + 1][y - 1] / maxPointsPerSquare) / 1.5
    }
    if (x > 0 && y < height - 1) {
      velChange[0] += (squares[x - 1][y + 1] / maxPointsPerSquare) / 1.5
      velChange[1] -= (squares[x - 1][y + 1] / maxPointsPerSquare) / 1.5
    }
    if (x < width - 1 && y < height - 1) {
      velChange[0] -= (squares[x + 1][y + 1] / maxPointsPerSquare) / 1.5
      velChange[1] -= (squares[x + 1][y + 1] / maxPointsPerSquare) / 1.5
    }
    */

        velChange[0] += globalDirection[0]
        velChange[1] += globalDirection[1]

        points[i][2] *= 0.99
        points[i][3] *= 0.99

        points[i][2] = Math.max(
            -maxSpeed,
            Math.min(maxSpeed, points[i][2] * speedDecay + velChange[0])
        )
        points[i][3] = Math.max(
            -maxSpeed,
            Math.min(maxSpeed, points[i][3] * speedDecay + velChange[1])
        )

        points[i][0] += points[i][2] * squaresPerMilli * frameTime
        points[i][1] += points[i][3] * squaresPerMilli * frameTime

        points[i][0] = Math.max(0, Math.min(width - 1, points[i][0]))
        points[i][1] = Math.max(0, Math.min(height - 1, points[i][1]))

        newSquares[~~(points[i][0] + 0.5)][~~(points[i][1] + 0.5)] += 1
    }

    squares = newSquares

    for (var x = 0; x < width; x++) {
        for (var y = 0; y < height; y++) {
            var strength = squares[x][y] / maxPointsPerSquare
            ctx.globalAlpha = Math.max(0.1, strength * 1.5)
            ctx.fillStyle =
                'hsl(200,' +
                (strength * 100 + 30).toString() +
                '%,' +
                (strength * 70 + 30).toString() +
                '%)'

            ctx.fillRect(
                x * squareSize + squarePadding / 2,
                y * squareSize + squarePadding / 2,
                squareSize - squarePadding,
                squareSize - squarePadding
            )
        }
    }
    /*
    ctx.globalAlpha = 1
    for (var i = 0; i < points.length; i++) {
        ctx.fillStyle = 'red'
        
        ctx.fillRect(points[i][0] * squareSize, points[i][1] * squareSize, 3, 3)
    }
    */

    requestAnimationFrame(drawAndUpdate)
}

setup()
window.onresize = setup

document.body.onclick = function() {
    if (document.body.requestFullscreen) {
        document.body.requestFullscreen()
    } else if (document.body.webkitRequestFullscreen) {
        document.body.webkitRequestFullscreen()
    } else if (document.body.mozRequestFullscreen) {
        document.body.mozRequestFullscreen()
    } else if (document.body.msRequestFullscreen) {
        document.body.msRequestFullscreen()
    }
}

requestAnimationFrame(drawAndUpdate)

if (window.DeviceMotionEvent) {
    /*
    window.addEventListener('devicemotion', function(event) {
        if (event.accelerationIncludingGravity) {
            directionSource = 'motion'

            globalDirection[0] = event.accelerationIncludingGravity.x * 0.02
            globalDirection[0] = event.accelerationIncludingGravity.x * 0.02
        }
    })
    */
}
if (window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', function(event) {
        directionSource === 'random' ? (directionSource = 'orient') : false
        if (directionSource !== 'orient') {
            return false
        }

        globalDirection[0] = Math.min(1, Math.max(-1, event.gamma / 90)) * 0.2
        globalDirection[1] = Math.min(1, Math.max(-1, event.beta / 90)) * 0.2
    })
}

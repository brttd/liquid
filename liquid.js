var messageDiv = document.getElementById('message')

var canvas = document.getElementById('canvas')
var ctx = canvas.getContext('2d')

var squareSize = 20
var squarePadding = 5

var maxPointsPerSquare = 20

var squaresPerMilli = 0.008
var maxSpeed = 6

var maxPush = maxPointsPerSquare * 4

var speedDecay = 0.99

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
var newSquares = []

var lastFrameTime = Date.now()

var globalDirection = [0, 0]
var directionSource = 'random'
var maxDirectionSpeed = 0.08

function showMessage(text) {
    messageDiv.textContent = text

    messageDiv.style.display = ''

    setTimeout(function() {
        messageDiv.style.display = 'none'
    }, 1000 * 6)
}

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
            Math.random() * (width - 0.02) + 0.01,
            Math.random() * (height - 0.02) + 0.01,
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
        squares[~~points[i][0]][~~points[i][1]] += 1
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

    newSquares = []

    for (var x = 0; x < width; x++) {
        newSquares.push([])

        for (var y = 0; y < height; y++) {
            var strength = squares[x][y] / maxPointsPerSquare

            ctx.globalAlpha = Math.max(0.1, Math.min(1, strength * 1.5 + 0.1))
            ctx.fillStyle =
                'hsl(200,' +
                Math.min(100, strength * 60 + 40).toString() +
                '%,' +
                Math.min(80, strength * 70 + 30).toString() +
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
        var x = ~~points[i][0]
        var y = ~~points[i][1]

        var velChange = [0, 0]

        //Move away from the square to the left. If on left edge, move away from own square
        velChange[0] +=
            Math.min(maxPush, squares[x - (x === 0 ? 0 : 1)][y]) /
            maxPointsPerSquare

        velChange[0] -=
            Math.min(maxPush, squares[x + (x === width - 1 ? 0 : 1)][y]) /
            maxPointsPerSquare

        if (
            (x === 0 && points[i][2] < 0) ||
            (x === width - 1 && points[i][2] > 0)
        ) {
            points[i][2] *= -0.2
        }

        velChange[1] +=
            Math.min(maxPush, squares[x][y - (y === 0 ? 0 : 1)]) /
            maxPointsPerSquare

        velChange[1] -=
            Math.min(maxPush, squares[x][y + (y === height - 1 ? 0 : 1)]) /
            maxPointsPerSquare

        if (
            (y === 0 && points[i][3] < 0) ||
            (y === height - 1 && points[i][3] > 0)
        ) {
            points[i][3] *= -0.2
        }

        velChange[0] = velChange[0] * 0.2 + globalDirection[0]
        velChange[1] = velChange[1] * 0.2 + globalDirection[1]

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

        points[i][0] =
            points[i][0] < 0.01
                ? 0.01
                : points[i][0] > width - 0.01
                    ? width - 0.01
                    : points[i][0]

        points[i][1] =
            points[i][1] < 0.01
                ? 0.01
                : points[i][1] > height - 0.01
                    ? height - 0.01
                    : points[i][1]

        newSquares[~~points[i][0]][~~points[i][1]] += 1
    }

    squares = newSquares

    requestAnimationFrame(drawAndUpdate)
}

setup()
window.onresize = setup

window.addEventListener('orientationchange', function() {
    showMessage('Please disable screen rotation!')
})

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

    if (window.screen.lockOrientation) {
        window.screen.lockOrientation('portrait')
    } else if (window.screen.mozLockOrientation) {
        window.screen.mozLockOrientation('portrait')
    } else if (window.screen.msLockOrientation) {
        window.screen.msLockOrientation('portrait')
    }
}

requestAnimationFrame(drawAndUpdate)

var xScale = -1

if (!window.chrome && !navigator.userAgent.toLowerCase().includes('chrome')) {
    //xScale = 1

    showMessage(
        "Orientation may be incorrect, as this hasn't been tested on browsers other than Chrome"
    )
}

if (window.DeviceMotionEvent) {
    window.addEventListener('devicemotion', function(event) {
        if (
            event.accelerationIncludingGravity.x ||
            event.accelerationIncludingGravity.y
        ) {
            directionSource = 'motion'

            globalDirection[0] =
                event.accelerationIncludingGravity.x * 0.02 * xScale
            globalDirection[1] = event.accelerationIncludingGravity.y * 0.02
        }
    })
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

setTimeout(function() {
    if (directionSource === 'random') {
        showMessage(
            'Unable to get orientation or motion information from device!\nThe gravity direction will be random.'
        )
    }
}, 1000 * 1.5)

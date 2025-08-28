const canvas = document.getElementById('game')
const ctx = canvas.getContext('2d')
const GRID = 24 // tamanho da célula
const COLS = Math.floor(canvas.width / GRID)
const ROWS = Math.floor(canvas.height / GRID)


const scoreEl = document.getElementById('score')
const bestEl = document.getElementById('best')
const speedEl = document.getElementById('speed')


const TOUCH_BREAKPOINT = 720


const SFX = {
    eat: new Audio(),
    crash: new Audio()
}

// Sons
SFX.eat.src = 'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA'
SFX.crash.src = 'data:audio/mp3;base64,//uQZAAAAAAAAAAAAAAAAAAAA'


// ===== Estado do jogo =====
let snake, dir, nextDir, food, score, best, loop, paused, speedMult


function reset() {
    snake = [{ x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) }]
    // começa com 3 blocos
    for (let i = 1; i <= 2; i++) snake.push({ x: snake[0].x - i, y: snake[0].y })
    dir = 'RIGHT'
    nextDir = dir
    score = 0
    speedMult = 1 // multiplicador de velocidade
    paused = false
    placeFood()
    updateUI()
}

function loadBest() {
    best = Number(localStorage.getItem('snake_best') || 0)
    bestEl.textContent = best
}


function saveBest() {
    localStorage.setItem('snake_best', String(best))
}


function updateUI() {
    scoreEl.textContent = score
    bestEl.textContent = best
    speedEl.textContent = speedMult.toFixed(1) + 'x'
}


function placeFood() {
    while (true) {
        const x = Math.floor(Math.random() * COLS)
        const y = Math.floor(Math.random() * ROWS)
        if (!snake.some(s => s.x === x && s.y === y)) {
            food = { x, y }
            break
        }
    }
}

function drawCell(x, y, fill, stroke) {
    ctx.fillStyle = fill
    ctx.strokeStyle = stroke
    const px = x * GRID
    const py = y * GRID
    ctx.fillRect(px + 1, py + 1, GRID - 2, GRID - 2)
    ctx.strokeRect(px + 0.5, py + 0.5, GRID - 1, GRID - 1)
}


function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.lineWidth = 1
    for (let x = 0; x < COLS; x++) {
        for (let y = 0; y < ROWS; y++) {
            ctx.strokeStyle = 'rgba(255,255,255,0.03)'
            ctx.strokeRect(x * GRID + 0.5, y * GRID + 0.5, GRID - 1, GRID - 1)
        }
    }
}

function tick() {
    if (paused) return // não atualiza quando estiver pausado
}

    dir = nextDir // aplica direção escolhida


    // próxima cabeça
    const head = { ...snake[0] }
    if (dir === 'LEFT') head.x--
    if (dir === 'RIGHT') head.x++
    if (dir === 'UP') head.y--
    if (dir === 'DOWN') head.y++


    // bater na parede
    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        gameOver()
        return
    }


    // bater em si mesmo
    if (snake.some((s, i) => i > 0 && s.x === head.x && s.y === head.y)) {
        gameOver()
        return
    }

    snake.unshift(head)


    // comer
    if (head.x === food.x && head.y === food.y) {
        score += 10
        if (score > best) { best = score; saveBest() }
        updateUI()
        placeFood();
        // acelera levemente conforme cresce
        if (speedMult < 3) {
            speedMult = Math.min(3, speedMult + 0.05)
            updateLoop()
            updateUI()
        } else {
            snake.pop()
        }


        render()
    }


    function gameOver() {
        paused = true
        render(true)
    }

    function render(isGameOver = false) {
        drawGrid()


        // comida
        drawCell(food.x, food.y, 'rgba(56,189,248,0.25)', 'rgba(56,189,248,0.5)')


        // cobra
        snake.forEach((p, i) => {
            const alpha = Math.max(0.25, 1 - i * 0.03)
            drawCell(p.x, p.y, `rgba(34,197,94,${alpha})`, 'rgba(34,197,94,0.7)')
        })


        if (isGameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.55)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#fff'
            ctx.textAlign = 'center'
            ctx.font = 'bold 28px system-ui'
            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 8)
            ctx.font = '14px system-ui'
            ctx.fillStyle = '#cbd5e1'
            ctx.fillText('Pressione R para reiniciar', canvas.width / 2, canvas.height / 2 + 18)
        }

        if (paused && !isGameOver) {
            ctx.fillStyle = 'rgba(0,0,0,0.35)'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            ctx.fillStyle = '#e5e7eb'
            ctx.textAlign = 'center'
            ctx.font = 'bold 22px system-ui'
            ctx.fillText('Pausado', canvas.width / 2, canvas.height / 2)
        }
    }


    function updateLoop() {
        if (loop) clearInterval(loop)
        const baseMs = 140 // quanto menor, mais rápido
        const interval = Math.max(40, baseMs / speedMult)
        loop = setInterval(tick, interval)
    }

    // ===== Controles =====
    function setDirection(newDir) {

        const opposite = { LEFT: 'RIGHT', RIGHT: 'LEFT', UP: 'DOWN', DOWN: 'UP' }
        if (opposite[dir] === newDir) return
        if (nextDir !== newDir) nextDir = newDir
    }


    window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase()
        if (k === 'arrowleft' || k === 'a') setDirection('LEFT')
        if (k === 'arrowright' || k === 'd') setDirection('RIGHT')
        if (k === 'arrowup' || k === 'w') setDirection('UP')
        if (k === 'arrowdown' || k === 's') setDirection('DOWN')
        if (k === ' ') {
             paused = !paused; if (!paused) render() 
        }
        if (k === '+') { speedMult = Math.min(3, +(speedMult + 0.1).toFixed(1))
             updateLoop()
             updateUI() 
            }
        if (k === '-') { speedMult = Math.max(0.5, +(speedMult - 0.1).toFixed(1))
             updateLoop()
             updateUI() 
            }
        if (k === 'r') { 
            reset()
             render()
             }
    });

    // Controles touch
    const touchControls = document.getElementById('touchControls')
    function setupTouch() {
        if (window.innerWidth <= TOUCH_BREAKPOINT) {
            touchControls.style.display = 'grid'
        } else {
            touchControls.style.display = 'none'
        }
    }
    window.addEventListener('resize', setupTouch)
    setupTouch()


    touchControls.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-dir]')
        if (!btn) return
        const dir = btn.getAttribute('data-dir')
        setDirection(dir)
    });
    document.getElementById('pauseBtn').addEventListener('click', () => { paused = !paused; render(); })


    // ===== Inicialização =====
    loadBest()
    reset()
    render()
    updateLoop()
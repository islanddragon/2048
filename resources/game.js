// @ts-check
const directions = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3,
}

const keys = {
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  LEFT: 37,
  W: 87,
  D: 68,
  S: 83,
  A: 65,
}

const revKeys = {
  38: keys.UP,
  39: keys.RIGHT,
  40: keys.DOWN,
  37: keys.LEFT,
  87: keys.W,
  68: keys.D,
  83: keys.S,
  65: keys.A,
}

const keyMap = {
  [keys.UP]: directions.UP,
  [keys.RIGHT]: directions.RIGHT,
  [keys.DOWN]: directions.DOWN,
  [keys.LEFT]: directions.LEFT,
  [keys.W]: directions.UP,
  [keys.D]: directions.RIGHT,
  [keys.S]: directions.DOWN,
  [keys.A]: directions.LEFT,
}

const model = {
  ROWS: 4,
  COLS: 4,
  tiles: [],
  newSpawn: null,
  lastSpawn: null,
  movements: {
    [directions.UP]: [[0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15]],
    [directions.RIGHT]: [[3, 2, 1, 0], [7, 6, 5, 4], [11, 10, 9, 8], [15, 14, 13, 12]],
    [directions.DOWN]: [[12, 8, 4, 0], [13, 9, 5, 1], [14, 10, 6, 2], [15, 11, 7, 3]],
    [directions.LEFT]: [[0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15]],
  },
}

const view = {
  elements: {},
  bg: document.getElementById('bg'),
  tiles: document.getElementById('tiles'),
  scoreLbl: document.getElementById('score'),
  restartBtn: document.getElementById('restart'),
  end: document.getElementById('end'),
  scoreVal: document.getElementById('scoreVal'),
}

let movementQueue = []
let movement = true

// @ts-ignore
var hammertimeBG = new Hammer(view.bg)
// @ts-ignore
var hammertimeTiles = new Hammer(view.tiles)
// @ts-ignore
hammertimeBG.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
// @ts-ignore
hammertimeTiles.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
hammertimeBG.on('swipeleft swiperight swipeup swipedown', ev => movementQueue.push({ swipeup: 38, swiperight: 39, swipedown: 40, swipeleft: 37 }[ev.type]))
hammertimeTiles.on('swipeleft swiperight swipeup swipedown', ev => movementQueue.push({ swipeup: 38, swiperight: 39, swipedown: 40, swipeleft: 37 }[ev.type]))

const createTileElem = (x, y, value, jump = false) => {
  let el = document.createElement('div')
  let inner = document.createElement('div')
  inner.innerText = value.toString()
  el.appendChild(inner)
  el.className = `tile tile_${value} loc_${x}_${y} `
  if (jump == true) {
    inner.addEventListener('animationend', e => { el.className = el.className.replace('tile_spawned', '') })
    el.className += 'tile_spawned'
  }
  return el
}

const render = () => {
  let out = ''
  model.tiles.forEach(cell => {
    out += cell.value
    if (cell.x === 3) out += "\n"
  })

  model.tiles.forEach(t => {
    if (t.value === 0 && t.jump !== true) return

    let el = createTileElem(t.x, t.y, t.value, t.jump)
    t.jump = false
    view.tiles.appendChild(el)
    Array.prototype.slice.apply(view.tiles.getElementsByClassName(`loc_${t.x}_${t.y}`)).forEach(e => {
      if (el === e) return
      e.parentElement.removeChild(e)
    })
  })
  movement = false
}

const restart = () => {
  view.tiles.innerHTML = ''
  view.end.className = ''
  model.tiles = []
  for (let y = 0; y < model.ROWS; y++) {
    for (let x = 0; x < model.COLS; x++) {
      let id = x + y * model.COLS
      model.tiles.push({ id, x, y, value: 0, jump: false })
    }
  }
  view.scoreVal.innerText = '0'
  spawn().then(_ => {
    render()
  })
}

const update = (index, val, jump = false) => {
  const cell = model.tiles[index]
  cell.value = val
  cell.jump = jump
}

const score = (val) => {
  view.scoreVal.innerText = parseInt(view.scoreVal.innerText) + val
}

const spawn = () => {
  return new Promise((resolve, reject) => {
    let validCells = model.tiles.filter(c => c.value === 0)
    let index = Math.round(Math.random() * (validCells.length - 1))
    let value = 2 || 4
    update(validCells[index].id, value, true)
    setTimeout(() => {
      resolve()
    }, 100);
  })
}

const log = str => false

const remainingMoves = () => {
  if (model.tiles.find(c => c.value === 0) !== undefined) return true
  let len = model.tiles.length

  for (let y = 0; y < model.ROWS; y++) {
    for (let x = 0; x < model.COLS; x++) {
      let i = x + y * model.ROWS

      if (x < model.ROWS - 1) {
        let j = x + 1 + y * model.ROWS
        if (model.tiles[i].value === model.tiles[j].value) return true
      }

      if (y < model.COLS - 1) {
        let k = x + (y + 1) * model.ROWS
        if (model.tiles[i].value === model.tiles[k].value) return true
      }
    }
  }

  return false
}

const move = (fromX, fromY, toX, toY) => {
  return new Promise((resolve, reject) => {
    let fromClass = `loc_${fromX}_${fromY}`
    let toClass = `loc_${toX}_${toY}`
    let from = view.tiles.getElementsByClassName(fromClass)[0]

    from.className = from.className.replace(fromClass, toClass)
    setTimeout(() => {
      resolve()
    }, 100);

  })
}

const merge = (fromX, fromY, toX, toY) => {
  return new Promise((resolve, reject) => {
    let fromClass = `loc_${fromX}_${fromY}`
    let toClass = `loc_${toX}_${toY}`
    let from = view.tiles.getElementsByClassName(fromClass)[0]
    let to = view.tiles.getElementsByClassName(toClass)[0]

    let listener = e => {
      from.removeEventListener('transitionend', listener)
      to.parentElement.removeChild(to)
    }
    from.addEventListener('transitionend', listener)

    from.className = from.className.replace(fromClass, toClass)
    setTimeout(() => {
      resolve()
    }, 100);

  })
}

const executeAction = (key) => {
  let movements = []

  model.movements[keyMap[key]].map(seq => seq.reduce((acc, value, i, arr) => {
    let to = model.tiles[acc]
    let set = arr.slice(i)

    // Look ahead for tiles that could be merged or moved
    for (let k = 0; k < set.length; k++) {
      let from = model.tiles[set[k]]

      if (from.value === 0) {
        // Ignore 0 tiles
        continue
      }

      if (to.value === 0) {
        // Started at empty tile, and found a tile with value. Move it to our starting tile
        update(to.id, from.value)
        update(from.id, 0)
        movements.push(move(from.x, from.y, to.x, to.y))
        k = 0

        // Keep looking
        continue;
      }


      if (from.value === to.value) {
        // Started with value tie, and found a tile with equal value. Merge them on the starting tile
        update(to.id, from.value * 2)
        score(from.value * 2)
        update(from.id, 0)
        movements.push(merge(from.x, from.y, to.x, to.y).then(_ => to.jump = true))
      }

      // We found an obstacle, but it does not match our starting tile value, go to next starting tile instead
      break;
    }

    // We did all we could, go to next starting tile
    return value
  }))

  if (remainingMoves() === false) {
    view.end.className = 'over'
    return new Promise(resolve => resolve())
  }

  if (movements.length > 0) {
    movements.push(spawn())
  }

  return Promise.all(movements)
}

restart()

document.addEventListener('keyup', e => {
  if (revKeys.hasOwnProperty(e.keyCode) === true) movementQueue.push(e.keyCode)
})
view.restartBtn.addEventListener('click', () => restart())

const animate = (ts) => {
  if (movement === true) return requestAnimationFrame(animate)
  if (movementQueue.length === 0) return requestAnimationFrame(animate)


  let m = movementQueue.shift()
  movementQueue = []
  executeAction(m).then(() => {
    render()
    requestAnimationFrame(animate)
  })
}

animate()

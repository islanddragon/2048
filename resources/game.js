const ROWS = 4
const COLS = 4

let game = document.getElementById('game')
let scoreLbl = document.getElementById('score')
let restartBtn = document.getElementById('restart')
let end = document.getElementById('end')

var hammertime = new Hammer(game)
hammertime.get('swipe').set({ direction: Hammer.DIRECTION_ALL })
hammertime.on('swipeleft swiperight swipeup swipedown', ev => move({ swipeup: 38, swiperight: 39, swipedown: 40, swipeleft: 37 }[ev.type]))

let cells = []

const restart = () => {
  end.className = ''
  cells = []
  game.innerHTML = ""
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let id = x + y * COLS
      let el = document.createElement('div')
      let value = 0
      el.className = `cell val_${value} cell_${id} row_${y} col_${x}`
      el.innerText = value
      game.appendChild(el)
      cells.push({ id, x, y, el, value })
    }
  }
  spawn()
}

const update = (index, val) => {
  const cell = cells[index]
  cell.value = val
  cell.el.innerText = val
  cell.el.className = `cell val_${cell.value} cell_${cell.id} row_${cell.y} col_${cell.x}`
}

const spawn = () => {
  // return
  let validCells = cells.filter(c => c.value === 0)
  let index = Math.round(Math.random() * (validCells.length - 1))
  update(validCells[index].id, 2)
  cells.map(c => c.el.className = c.el.className.replace(' val_new', ''))
  validCells[index].el.className += " val_new"
}

const log = () => false

const movements = {
  // Up
  38: [
    [0, 4, 8, 12],
    [1, 5, 9, 13],
    [2, 6, 10, 14],
    [3, 7, 11, 15],
  ],
  // Right
  39: [
    [3, 2, 1, 0],
    [7, 6, 5, 4],
    [11, 10, 9, 8],
    [15, 14, 13, 12],
  ],
  // Down
  40: [
    [12, 8, 4, 0],
    [13, 9, 5, 1],
    [14, 10, 6, 2],
    [15, 11, 7, 3],
  ],
  // Left
  37: [
    [0, 1, 2, 3],
    [4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15],
  ],
}

const movesLeft = () => {
  if (cells.find(c => c.value === 0) !== undefined) return true
  let len = cells.length

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let i = x + y * ROWS

      if (x < ROWS - 1) {
        let j = x + 1 + y * ROWS
        if (cells[i].value === cells[j].value) return true
      }

      if (y < COLS - 1) {
        let k = x + (y + 1) * ROWS
        if (cells[i].value === cells[k].value) return true
      }
    }
  }

  return false
}

const move = (key) => {
  let moves = 0
  movements.hasOwnProperty(key) && movements[key].map(seq => seq.reduce((acc, value, i, arr) => {
    let current = cells[acc]
    log(`Iteration ${i}`)
    log(`Current tile[${acc}] = ${current.value}`)
    let set = arr.slice(i)
    log(set)

    for (let k = 0; k < set.length; k++) {
      const lookupI = set[k];
      let lookup = cells[lookupI]
      log(` Lookup tile[${lookupI}] = ${lookup.value}`)

      if (current.value === 0) {
        log(`   Current is 0`)
        if (lookup.value !== 0) {
          log(`   Lookup is not 0`)
          log(`   Tile[${lookupI}] = ${lookup.value} moved to Tile[${acc}] = ${current.value} `)
          update(acc, lookup.value)
          update(lookupI, 0)
          moves += 1
          k = 0
        }
      } else {
        log(`   Current is not 0`)
        if (lookup.value === current.value) {
          log(`   Lookup is not 0`)
          log(`   Tile[${lookupI}] = ${lookup.value} moved to Tile[${acc}] = ${current.value} `)
          update(acc, current.value * 2)
          update(lookupI, 0)
          moves += 1
          return value
        } else if (lookup.value === 0) {
          continue
        } else {
          log(`   Lookup is not equal to current`)
          return value
        }
      }
    }
    return value
  }))

  if (movesLeft() === false) {
    end.className = 'over'
    return
  }

  if (moves > 0) {
    spawn()
  }
}

restart()

document.addEventListener('keyup', e => move(e.keyCode > 40 ? { 87: 38, 68: 39, 83: 40, 65: 37 }[e.keyCode] : e.keyCode))
restartBtn.addEventListener('click', () => restart())

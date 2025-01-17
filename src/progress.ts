import ansiEscapes from 'ansi-escapes'
import wrapAnsi from 'wrap-ansi'
import { log } from './utils.js'

type TokenType = Record<string, any>
type OptionsType = {
  stream?: NodeJS.WriteStream
  curr?: number
  total: number
  complete?: string
  incomplete?: string
  head?: string
  renderThrottle?: number
  callback?: Function
  clear?: boolean
  width?: number
}

class ProgressBar {
  /** from option */
  private stream: NodeJS.WriteStream
  private fmt: string
  private curr: number
  private clear: boolean
  private lines: number
  private chars: {
    complete: string
    incomplete: string
    head: string
  }
  private total: number
  private width: number
  private renderThrottle: number
  private callback: Function
  /** from option */

  complete: boolean
  private tokens: TokenType
  private lastRender: number
  private lastDraw: string
  private start: number
  private columns: number

  constructor(fmt: string, options: OptionsType | number) {
    if (typeof options === 'number') {
      const total = options
      options = {
        total: total
      }
    } else {
      options = options || {}
      if (typeof fmt !== 'string') throw new Error('format required')

      if (typeof options.total !== 'number') throw new Error('total required')
    }

    const {
      stream = process.stderr,
      curr = 0,
      total,
      width,
      clear = false,
      complete,
      incomplete,
      head,
      renderThrottle,
      callback
    } = options

    this.stream = stream
    this.fmt = fmt
    this.curr = curr || 0
    this.total = total
    this.columns = (process.stderr.columns || 80) - 10
    this.width = width || this.columns - 38 * 2;
    this.clear = clear
    this.lines = fmt.split('\n').length
    this.chars = {
      complete: complete || '=',
      incomplete: incomplete || '-',
      head: head || complete || '='
    }
    this.complete = false
    this.renderThrottle = renderThrottle !== 0 ? renderThrottle || 16 : 0
    this.lastRender = -Infinity
    this.callback = callback || function() {}
    this.tokens = {}
    this.start = Date.now()
    this.lastDraw = ''
  }

  tick = (len: number, tokens: TokenType) => {
    if (len !== 0) len = len || 1
    // swap tokens
    if ('object' == typeof len) (tokens = len), (len = 1)
    if (tokens) this.tokens = tokens

    // start time for eta
    this.curr += len
    if (0 == this.curr) this.start = Date.now()

    // try to render
    this.render()

    // progress complete
    if (this.curr >= this.total) {
      this.render(true)
      this.complete = true
      this.terminate()
      this.callback(this)
    }
  }
  render = (force: boolean = false, tokens?: Record<string, any>) => {
    if (tokens) this.tokens = tokens

    if (!this.stream.isTTY) return

    const now = Date.now()
    const delta = now - this.lastRender
    if (!force && delta < this.renderThrottle) {
      return
    } else {
      this.lastRender = now
    }

    let ratio = this.curr / this.total
    ratio = Math.min(Math.max(ratio, 0), 1)

    const percent = Math.floor(ratio * 100)
    let incomplete, complete, completeLength
    const elapsed = Date.now() - this.start
    const eta =
      percent == 100 ? 0 : (elapsed / this.curr) * (this.total - this.curr)
    const rate = this.curr / (elapsed / 1000)

    /* populate the bar template with percentages and timestamps */
    let str = this.fmt
      .replace(':current', String(this.curr))
      .replace(':total', String(this.total))
      .replace(':elapsed', isNaN(elapsed) ? '0.0' : (elapsed / 1000).toFixed(1))
      .replace(
        ':eta',
        isNaN(eta) || !isFinite(eta) ? '0.0' : (eta / 1000).toFixed(1)
      )
      .replace(':percent', percent.toFixed(0) + '%')
      .replace(':rate', String(Math.round(rate)))

    /* compute the available space (non-zero) for the bar */
    let availableSpace = Math.max(
      0,
      this.stream.columns - str.replace(':bar', '').length
    )
    if (availableSpace && process.platform === 'win32') {
      availableSpace = availableSpace - 1
    }

    const width = Math.min(this.width, availableSpace)

    /* TODO: the following assumes the user has one ':bar' token */
    completeLength = Math.round(width * ratio)
    complete = Array(Math.max(0, completeLength + 1)).join(this.chars.complete)
    incomplete = Array(Math.max(0, width - completeLength + 1)).join(
      this.chars.incomplete
    )

    /* add head to the complete string */
    if (completeLength > 0) complete = complete.slice(0, -1) + this.chars.head

    /* fill in the actual progress bar */
    str = str.replace(':bar', complete + incomplete)

    /* replace the extra tokens */
    if (this.tokens)
      for (const key in this.tokens) {
        const wrappedLines = wrapAnsi(this.tokens[key], this.columns, {
          trim: false,
          hard: true,
          wordWrap: false
        })
        str = str.replace(':' + key, wrappedLines)
      }

    if (this.lastDraw !== str) {
      if (this.lastDraw) this.stream.write(ansiEscapes.eraseLines(this.lines))
      this.lines = str.split('\n').length
      this.stream.write(str)
      this.lastDraw = str
    }
  }
  update = (ratio: number, tokens: TokenType) => {
    const goal = Math.floor(ratio * this.total)
    const delta = goal - this.curr

    this.tick(delta, tokens)
  }
  interrupt = (message: string) => {
    // clear the current line
    this.stream.clearLine(1)
    // move the cursor to the start of the line
    this.stream.cursorTo(0)
    // write the message text
    this.stream.write(message)
    // terminate the line after writing the message
    this.stream.write('\n')
    // re-display the progress bar with its lastDraw
    this.stream.write(this.lastDraw)
  }
  terminate = () => {
    if (this.clear) {
      this.stream.write(ansiEscapes.eraseLines(this.lines))
      this.stream.cursorTo(0)
    } else {
      this.stream.write('\n')
    }
  }
}


export class SimpleProgressBar {
  private total: number
  private current: number;
  constructor(total: number) {
    log.info('如果你看到这个消息，说明你的bash不支持格式化输入')
    this.total = total
    this.current = 0
  }
  tick = (count: number) => {
    this.current += count
    log.info(`执行中，当前进度${this.current}/${this.total}`)
  }
}

export default ProgressBar

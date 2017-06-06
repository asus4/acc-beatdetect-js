import {
  vec3
} from 'gl-matrix'
import Stats from 'stats.js'
import LowPassFilter from './lowpass-filter'
import BeatDetector from './beat-detector'

import './main.styl'
document.body.innerHTML = require('./body.pug')()

class App {
  constructor() {
    let canvas = document.getElementById('graph_canvas')
    this.ctx = canvas.getContext('2d')
    this.size = {
      width: canvas.clientWidth,
      height: canvas.clientHeight
    }

    let SR = 60
    this.filter = new LowPassFilter(0.5, 1 / SR)
    this.beatDetector = new BeatDetector(SR, 256, 40, 160)
    this.bpmFilter = new LowPassFilter(0.2, 1 / SR)

    this.logs = new Float32Array(256)
    this.filterdLogs = new Float32Array(256)
    this.info = document.getElementById('info')

    // setup stats
    this.stats = new Stats()
    this.stats.domElement.style.position = 'absolute'
    this.stats.domElement.style.right = '0px'
    this.stats.domElement.style.bottom = '0px'
    document.body.appendChild(this.stats.domElement)

    // events
    window.addEventListener('devicemotion', this.onDeviceMotion.bind(this))
    this.draw()
  }

  onDeviceMotion(e) {
    this.stats.update()

    let v = e.acceleration
    let acc = vec3.length([v.x, v.y, v.z])

    for (let i = 1; i < this.logs.length; ++i) {
      this.logs[i - 1] = this.logs[i]
      this.filterdLogs[i - 1] = this.filterdLogs[i]
    }
    this.logs[this.logs.length - 1] = acc
    this.filterdLogs[this.logs.length - 1] = this.filter.process(acc)

    let bpm = this.bpmFilter.process(this.beatDetector.process(this.logs))

    this.info.innerHTML = `BPM: ${bpm.toFixed(2)}<br>`
  }


  draw() {
    requestAnimationFrame(this.draw.bind(this))

    const length = this.logs.length
    const scale = 20
    const yoffset = 200
    const width = this.size.width * 2

    this.ctx.clearRect(0, 0, this.size.width * 2, this.size.height)

    // draw raw
    {
      this.ctx.strokeStyle = '#666'
      this.ctx.beginPath()
      this.ctx.moveTo(0, yoffset)
      for (let i = 0; i < length; ++i) {
        this.ctx.lineTo(i / length * width, yoffset - this.logs[i] * scale)
      }
      this.ctx.stroke()
    }

    // draw filterd
    {
      this.ctx.strokeStyle = '#F44'
      this.ctx.beginPath()
      this.ctx.moveTo(0, yoffset)
      for (let i = 0; i < length; ++i) {
        this.ctx.lineTo(i / length * width, yoffset - this.filterdLogs[i] * scale)
      }
      this.ctx.stroke()
    }

    // draw xorr
    {
      this.ctx.strokeStyle = '#4F4'
      this.ctx.beginPath()
      this.ctx.moveTo(0, yoffset)
      for (let i = 0; i < length; ++i) {
        this.ctx.lineTo(i / length * width, yoffset - this.beatDetector.buffer[i] * scale * 10)
      }
      this.ctx.stroke()
    }

  }
}

new App()
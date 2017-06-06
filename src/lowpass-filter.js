// Port form GRT cpp
// https://github.com/nickgillian/grt

export default class LowPassFilter {
  constructor(cutoffFrequency, delta) {
    this.cutoffFrequency = cutoffFrequency
    this.delta = delta
    this.filterdValue = 0

    let RC = (1.0 / (Math.PI * 2)) / cutoffFrequency
    this.filterFactor = delta / (RC + delta)
  }

  process(value) {
    let n = value * this.filterFactor + this.filterdValue * (1.0 - this.filterFactor)
    this.filterdValue = n
    return n
  }
}

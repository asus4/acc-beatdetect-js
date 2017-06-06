// http://jsfiddle.net/szimek/hGRva/
// http://tech.beatport.com/2014/web-audio/beat-detection-using-web-audio/

import LowPassFilter from './lowpass-filter'

export default class BeatDetector {
  constructor(samplingRate, bufferSize, minBpm, maxBpm) {
    this.samplingRate = samplingRate
    this.buffer = new Float32Array(bufferSize)

    this.filter = new LowPassFilter(0.5, 1 / samplingRate)
    this.freq = -1

    this.minFreq = minBpm / 60
    this.maxFreq = maxBpm / 60
  }

  process(input) {
    this._xorr(input, this.buffer)

    let locations = this._findpeaks(this.buffer)
    let diffs = this._diff(locations)
    let median = this._median(diffs)
    if (Number.isNaN(median)) {
      return -1
    }
    let currFreq = this._withinRange(this.samplingRate / median, this.minFreq, this.maxFreq)
    this.freq = this.filter.process(currFreq)
    return this.freq * 60 // return as BPM
  }

  _xorr(input, output) {
    let n = input.length,
      norm, sum, i, j

    for (i = 0; i < n; i++) {
      sum = 0
      for (j = 0; j < n; j++) {
        sum += (input[j] * (input[j + i] || 0)) // Pad input with zeroes
      }
      if (i == 0) {
        norm = sum
      }
      output[i] = sum / norm
    }
  }

  _findpeaks(data) {
    let locations = [0]
    for (let i = 1; i < data.length - 1; i++) {
      if (data[i] > 0 && data[i - 1] < data[i] && data[i] > data[i + 1]) {
        locations.push(i)
      }
    }
    return locations
  }

  _diff(data) {
    return data.reduce(
      (acc, value, i) => {
        acc[i] = data[i] - data[i - 1];
        return acc;
      }, []).slice(1)
  }

  _mean(data) {
    return data.reduce((acc, value) => acc + value, 0) / data.length
  }

  _median(data) {
    let half
    data.sort((a, b) => a - b)
    half = Math.floor(data.length / 2)

    if (data.length % 2) {
      return data[half]
    } else {
      return (data[half - 1] + data[half]) / 2.0
    }
  }

  _withinRange(curr, min, max) {
    while (curr < min) {
      curr *= 2
    }
    while (curr > max) {
      curr *= 0.5
    }
    return curr
  }

}
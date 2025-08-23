// Collection of audio visualization renderers.
// Each renderer is a small function (<40 LoC) that draws onto the canvas
// using analyser frequency data.

export type Visualization = (
  ctx: CanvasRenderingContext2D,
  data: Uint8Array,
  canvas: HTMLCanvasElement
) => void

export const visualizations: Record<string, Visualization> = {
  /** Draw vibrant vertical bars with rainbow hues. */
  rainbowBars: (ctx, data, canvas) => {
    const barWidth = canvas.width / data.length
    data.forEach((value, i) => {
      const hue = (i / data.length) * 360
      ctx.fillStyle = `hsl(${hue},100%,50%)`
      ctx.fillRect(i * barWidth, canvas.height - value, barWidth - 1, value)
    })
  },
  /** Uniform cyan bars for a minimal look. */
  monoBars: (ctx, data, canvas) => {
    const barWidth = canvas.width / data.length
    ctx.fillStyle = '#00ffcc'
    data.forEach((v, i) => {
      ctx.fillRect(i * barWidth, canvas.height - v, barWidth - 1, v)
    })
  },
  /** Radial spokes from the centre. */
  radialLines: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const r = Math.min(cx, cy) / 2
    const step = (Math.PI * 2) / data.length
    data.forEach((v, i) => {
      const angle = i * step
      const x = cx + Math.cos(angle) * (r + v)
      const y = cy + Math.sin(angle) * (r + v)
      ctx.strokeStyle = `hsl(${(i / data.length) * 360},100%,50%)`
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(x, y)
      ctx.stroke()
    })
  },
  /** Compact radial bars orbiting the centre. */
  radialBars: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const base = Math.min(cx, cy) / 4
    const step = (Math.PI * 2) / data.length
    data.forEach((v, i) => {
      const angle = i * step
      const h = v * 0.5
      const x = cx + Math.cos(angle) * base
      const y = cy + Math.sin(angle) * base
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(angle)
      ctx.fillStyle = `hsl(${(i / data.length) * 360},100%,50%)`
      ctx.fillRect(0, 0, 2, h)
      ctx.restore()
    })
  },
  /** Polygonal wave surrounding a circle. */
  circleWave: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const radius = Math.min(cx, cy) / 2
    ctx.beginPath()
    data.forEach((v, i) => {
      const angle = (i / data.length) * Math.PI * 2
      const r = radius + v / 2
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
    ctx.strokeStyle = '#ff00ff'
    ctx.stroke()
  },
  /** Spiralling line expanding with intensity. */
  spiral: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    ctx.beginPath()
    data.forEach((v, i) => {
      const angle = i * 0.1
      const r = i * 0.5 + v * 0.3
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#00ffff'
    ctx.stroke()
  },
  /** Pulsing dots across the canvas. */
  dots: (ctx, data, canvas) => {
    const step = canvas.width / data.length
    data.forEach((v, i) => {
      const size = v / 5
      ctx.fillStyle = `hsl(${(i / data.length) * 360},100%,50%)`
      ctx.beginPath()
      ctx.arc(i * step, canvas.height - v, size, 0, Math.PI * 2)
      ctx.fill()
    })
  },
  /** Mirrored white bars about the centre line. */
  mirrorBars: (ctx, data, canvas) => {
    const barWidth = canvas.width / data.length
    data.forEach((v, i) => {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(i * barWidth, canvas.height / 2, barWidth - 1, -v)
      ctx.fillRect(i * barWidth, canvas.height / 2, barWidth - 1, v)
    })
  },
  /** Jagged waveform resembling lightning. */
  zigZag: (ctx, data, canvas) => {
    const step = canvas.width / data.length
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = i * step
      const y = canvas.height - v
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#ffff00'
    ctx.stroke()
  },
  /** Gradient coloured smooth wave. */
  gradientWave: (ctx, data, canvas) => {
    const step = canvas.width / data.length
    const grad = ctx.createLinearGradient(0, 0, canvas.width, 0)
    grad.addColorStop(0, '#ff0000')
    grad.addColorStop(1, '#0000ff')
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = i * step
      const y = canvas.height - v
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = grad
    ctx.stroke()
  },
  /** Starburst of lines from centre. */
  starBurst: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    data.forEach((v, i) => {
      const angle = (i / data.length) * Math.PI * 2
      const x = cx + Math.cos(angle) * v
      const y = cy + Math.sin(angle) * v
      ctx.strokeStyle = '#ff9900'
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(x, y)
      ctx.stroke()
    })
  },
  /** Checkerboard that brightens with amplitude. */
  checkerPulse: (ctx, data, canvas) => {
    const size = 20
    for (let x = 0; x < canvas.width; x += size) {
      for (let y = 0; y < canvas.height; y += size) {
        const idx = Math.floor((x / canvas.width) * data.length)
        const v = data[idx]
        ctx.fillStyle = `rgba(0,255,255,${v / 255})`
        ctx.fillRect(x, y, size, size)
      }
    }
  },
  /** Lissajous curve modulated by frequency. */
  lissajous: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const a = 3
    const b = 2
    ctx.beginPath()
    data.forEach((v, i) => {
      const t = (i / data.length) * Math.PI * 2
      const x = cx + Math.sin(a * t + v / 50) * cx * 0.8
      const y = cy + Math.sin(b * t) * cy * 0.8
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#00ff00'
    ctx.stroke()
  },
  /** Orbiting dots forming circular paths. */
  orbitals: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    data.forEach((v, i) => {
      const angle = (i / data.length) * Math.PI * 2
      const r = 50 + v / 4
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      ctx.strokeStyle = '#ff00aa'
      ctx.beginPath()
      ctx.arc(x, y, 2, 0, Math.PI * 2)
      ctx.stroke()
    })
  },
  /** Hexagonal polygon pulsating outward. */
  polygonPulse: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const sides = 6
    const radius = Math.min(cx, cy) / 2
    ctx.beginPath()
    for (let i = 0; i < sides; i++) {
      const v = data[Math.floor((i / sides) * data.length)]
      const angle = (i / sides) * Math.PI * 2
      const r = radius + v / 4
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()
  },
  /** Symmetrical colourful bars like a kaleidoscope. */
  kaleidoscope: (ctx, data, canvas) => {
    const step = canvas.width / data.length
    data.forEach((v, i) => {
      const x = i * step
      const y = canvas.height - v
      ctx.fillStyle = `hsl(${(i / data.length) * 360},100%,50%)`
      ctx.fillRect(x, y, 4, v)
      ctx.fillRect(canvas.width - x, y, 4, v)
    })
  },
  /** Sine wave with amplitude from data. */
  sineWave: (ctx, data, canvas) => {
    const step = canvas.width / data.length
    ctx.beginPath()
    data.forEach((v, i) => {
      const x = i * step
      const y = canvas.height / 2 + Math.sin(i * 0.1) * v
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#00ffff'
    ctx.stroke()
  },
  /** Waterfall effect with translucent blue bars. */
  waterfall: (ctx, data, canvas) => {
    const barWidth = canvas.width / data.length
    ctx.globalCompositeOperation = 'lighter'
    data.forEach((v, i) => {
      ctx.fillStyle = `rgba(0,0,255,${v / 255})`
      ctx.fillRect(i * barWidth, 0, barWidth, canvas.height)
    })
    ctx.globalCompositeOperation = 'source-over'
  },
  /** Semi-circular arc resembling yin-yang motion. */
  yinYang: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const radius = Math.min(cx, cy) * 0.8
    const v = data[0]
    ctx.beginPath()
    ctx.arc(cx, cy, radius, Math.PI / 2 - (v / 255) * Math.PI, Math.PI / 2 + (v / 255) * Math.PI)
    ctx.strokeStyle = '#ffffff'
    ctx.stroke()
  },
  /** Petal-like dots forming a flower. */
  flower: (ctx, data, canvas) => {
    const cx = canvas.width / 2
    const cy = canvas.height / 2
    const petals = 8
    const radius = Math.min(cx, cy) / 2
    data.forEach((v, i) => {
      const angle = (i / data.length) * Math.PI * 2
      const r = radius + v / 5
      const x = cx + Math.cos(angle) * r
      const y = cy + Math.sin(angle) * r
      ctx.fillStyle = `hsl(${(i / data.length) * 360},100%,50%)`
      ctx.fillRect(x, y, 2, 2)
    })
    ctx.beginPath()
    for (let i = 0; i < petals; i++) {
      const angle = (i / petals) * Math.PI * 2
      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius
      ctx.moveTo(cx, cy)
      ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#ff00ff'
    ctx.stroke()
  }
}

export type VisualizationName = keyof typeof visualizations

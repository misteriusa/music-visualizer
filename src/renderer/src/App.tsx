import { useState, useRef, useEffect, useCallback } from 'react'
import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels'
import { PlayIcon, PauseIcon, UploadIcon } from '@radix-ui/react-icons'
import './index.css'

function App(): React.JSX.Element {
  const [isPlaying, setIsPlaying] = useState(false)
  const [tracks, setTracks] = useState([
    { name: 'Track Name', duration: '3:10' },
    { name: 'Power Play', duration: '2:50' },
    { name: 'Into the Sky', duration: '4:20' },
    { name: 'Hot Fire', duration: '3:40' }
  ])
  const [currentTrack, setCurrentTrack] = useState(0)
  const [progress, setProgress] = useState(0)
  const [audioFile, setAudioFile] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)

  useEffect(() => {
    if (audioFile && audioRef.current) {
      audioRef.current.src = audioFile
      audioRef.current.load()
    }
  }, [audioFile])

  /**
   * Render frequency data as colorful bars across the canvas.
   */
  const drawVisualization = useCallback((): void => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return

    // Ensure canvas matches its displayed size for crisp rendering
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight

    const ctx = canvas.getContext('2d')!
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const barWidth = canvas.width / bufferLength

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i]
      const hue = (i / bufferLength) * 360 // rainbow effect by index
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`
      ctx.fillRect(i * barWidth, canvas.height - barHeight, barWidth - 1, barHeight)
    }

    animationFrameRef.current = requestAnimationFrame(drawVisualization)
  }, [])

  /**
   * Initialise audio context & analyser before starting animation loop.
   */
  const startVisualization = useCallback((): void => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
      const source = audioContextRef.current.createMediaElementSource(audioRef.current!)
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8 // smooth bars for calmer motion
      source.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
    }
    drawVisualization()
  }, [drawVisualization])

  const stopVisualization = useCallback((): void => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play()
      startVisualization()
    } else if (audioRef.current) {
      audioRef.current.pause()
      stopVisualization()
    }
  }, [isPlaying, startVisualization, stopVisualization])

  const handleUpload = async (): Promise<void> => {
    const filePath = await window.electron.ipcRenderer.invoke('open-file-dialog')
    if (filePath) {
      setAudioFile(`file://${filePath}`)
      setTracks([{ name: filePath.split('/').pop() || 'Uploaded Track', duration: 'Unknown' }])
      setCurrentTrack(0)
    }
  }

  const Visualizer = (): React.JSX.Element => (
    <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-fuchsia-600 rounded-lg flex items-center justify-center">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )

  return (
    <div data-theme="cyberpunk" className="min-h-screen bg-background flex flex-col">
      <PanelGroup direction="horizontal" className="flex-1">
        <Panel defaultSize={20} minSize={15} className="bg-secondary p-4">
          <h2 className="text-lg font-bold mb-2">Tracks</h2>
          <ul>
            {tracks.map((track, index) => (
              <li
                key={index}
                className={`cursor-pointer p-2 rounded ${index === currentTrack ? 'bg-accent' : ''}`}
                onClick={() => setCurrentTrack(index)}
              >
                {track.name} <span className="float-right">{track.duration}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={60}>
          <Visualizer />
        </Panel>
        <PanelResizeHandle />
        <Panel defaultSize={20} minSize={15} className="bg-secondary p-4">
          <h2 className="text-lg font-bold mb-2">Visualizer Controls</h2>
          {/* Add controls here */}
        </Panel>
      </PanelGroup>
      <div className="bg-card p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button onClick={() => setIsPlaying(!isPlaying)} className="mr-4">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
          </button>
          <span>{tracks[currentTrack]?.name}</span>
        </div>
        <input
          type="range"
          value={progress}
          onChange={(e) => setProgress(Number(e.target.value))}
          className="flex-1 mx-4"
        />
        <span>1:15 / 3:45</span>
        <button onClick={handleUpload}>
          <UploadIcon className="ml-4" />
        </button>
        <audio ref={audioRef} className="hidden" />
      </div>
    </div>
  )
}

export default App

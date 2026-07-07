'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'

interface Props {
  title: string
  artist: string
  audioUrl: string
  coverUrl: string
  accent: string
}

export default function MusicPlayer({ title, artist, audioUrl, coverUrl, accent }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onTime    = () => setProgress(audio.currentTime)
    const onDur     = () => setDuration(audio.duration || 0)
    const onEnded   = () => setPlaying(false)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('durationchange', onDur)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('durationchange', onDur)
      audio.removeEventListener('ended', onEnded)
    }
  }, [])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio || !audioUrl) return
    if (playing) { audio.pause(); setPlaying(false) }
    else { audio.play(); setPlaying(true) }
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = Number(e.target.value)
    setProgress(Number(e.target.value))
  }

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`
  }

  const pct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div
      className="rounded-2xl overflow-hidden shadow-2xl"
      style={{
        background: 'rgba(10,0,0,0.55)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.1)',
        maxWidth: 360,
        margin: '0 auto',
      }}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div className="flex items-stretch" style={{ height: 80 }}>
        {/* Cover art — fills entire left side */}
        <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
          {coverUrl ? (
            <Image
              src={coverUrl}
              alt={title}
              fill
              className="object-cover"
              sizes="80px"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-2xl"
              style={{ background: `linear-gradient(135deg, ${accent}55, rgba(0,0,0,0.4))` }}>
              ♪
            </div>
          )}
        </div>

        {/* Right side — title + controls */}
        <div className="flex-1 px-3 py-2.5 flex flex-col justify-between min-w-0">
          {/* Title + artist */}
          <div className="min-w-0">
            <p className="font-playfair font-semibold text-white truncate leading-tight" style={{ fontSize: '0.8rem' }}>
              {title}
            </p>
            <p className="truncate leading-tight" style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.55)' }}>
              {artist}
            </p>
          </div>

          {/* Progress bar */}
          <div className="relative w-full" style={{ height: 14 }}>
            <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-0.5 rounded-full"
              style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'rgba(255,255,255,0.8)' }} />
            </div>
            <input type="range" min={0} max={duration || 1} step={0.1} value={progress}
              onChange={seek}
              className="absolute inset-0 w-full opacity-0 cursor-pointer" />
          </div>

          {/* Time + controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, progress - 10) }}
                style={{ color: 'rgba(255,255,255,0.6)' }}
                className="hover:text-white transition-colors"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={togglePlay}
                disabled={!audioUrl}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40 flex-shrink-0"
                style={{ background: 'white' }}
              >
                {playing
                  ? <Pause className="w-3.5 h-3.5" style={{ color: accent }} />
                  : <Play  className="w-3.5 h-3.5 ml-0.5" style={{ color: accent }} />
                }
              </button>

              <button
                onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, progress + 10) }}
                style={{ color: 'rgba(255,255,255,0.6)' }}
                className="hover:text-white transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex gap-1" style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.4)' }}>
              <span>{fmt(progress)}</span>
              <span>/</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

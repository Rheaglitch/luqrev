'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { Play, Pause, SkipBack, SkipForward, Volume2 } from 'lucide-react'

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
  const [volume, setVolume] = useState(0.8)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    audio.volume = volume

    const onTimeUpdate = () => setProgress(audio.currentTime)
    const onDurationChange = () => setDuration(audio.duration || 0)
    const onEnded = () => setPlaying(false)

    audio.addEventListener('timeupdate', onTimeUpdate)
    audio.addEventListener('durationchange', onDurationChange)
    audio.addEventListener('ended', onEnded)
    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate)
      audio.removeEventListener('durationchange', onDurationChange)
      audio.removeEventListener('ended', onEnded)
    }
  }, [volume])

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

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = Number(e.target.value)
    setVolume(v)
    if (audioRef.current) audioRef.current.volume = v
  }

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const progressPct = duration > 0 ? (progress / duration) * 100 : 0

  return (
    <div
      className="mx-6 mb-6 rounded-2xl overflow-hidden shadow-xl"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.12)' }}
    >
      {audioUrl && <audio ref={audioRef} src={audioUrl} preload="metadata" />}

      <div className="flex items-stretch">
        {/* Cover art */}
        <div className="relative flex-shrink-0" style={{ width: 90, height: 90 }}>
          {coverUrl ? (
            <Image src={coverUrl} alt={title} fill className="object-cover" sizes="90px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: 28, opacity: 0.4 }}>♪</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex-1 px-4 py-3 flex flex-col justify-between min-w-0">
          {/* Title & artist */}
          <div>
            <p className="font-playfair font-semibold text-white truncate" style={{ fontSize: '0.85rem' }}>{title}</p>
            <p className="text-white/60 truncate" style={{ fontSize: '0.72rem' }}>{artist}</p>
          </div>

          {/* Progress bar */}
          <div>
            <div className="relative w-full h-1 rounded-full mb-1" style={{ background: 'rgba(255,255,255,0.2)' }}>
              <div className="absolute left-0 top-0 h-full rounded-full transition-all" style={{ width: `${progressPct}%`, background: 'white' }} />
              <input
                type="range" min={0} max={duration || 1} step={0.1} value={progress}
                onChange={seek}
                className="absolute inset-0 w-full opacity-0 cursor-pointer h-full"
              />
            </div>
            <div className="flex justify-between" style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.5)' }}>
              <span>{fmt(progress)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between">
            {/* Playback */}
            <div className="flex items-center gap-3">
              <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.max(0, progress - 10) }}
                className="text-white/70 hover:text-white transition-colors">
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={togglePlay}
                disabled={!audioUrl}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-40"
                style={{ background: 'white' }}
              >
                {playing
                  ? <Pause className="w-4 h-4" style={{ color: accent }} />
                  : <Play  className="w-4 h-4 ml-0.5" style={{ color: accent }} />
                }
              </button>
              <button onClick={() => { if (audioRef.current) audioRef.current.currentTime = Math.min(duration, progress + 10) }}
                className="text-white/70 hover:text-white transition-colors">
                <SkipForward className="w-4 h-4" />
              </button>
            </div>

            {/* Volume */}
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3 h-3 text-white/50" />
              <div className="relative w-14 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${volume * 100}%`, background: 'rgba(255,255,255,0.7)' }} />
                <input type="range" min={0} max={1} step={0.01} value={volume}
                  onChange={changeVolume}
                  className="absolute inset-0 w-full opacity-0 cursor-pointer h-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

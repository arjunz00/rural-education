import React, { useState, useEffect, useRef } from 'react';
import { Icon } from './Icons';
import { resourcesAPI } from '../services/api';

export const AudioPlayerModal = ({ resource, onClose }) => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [isUsingSpeechFallback, setIsUsingSpeechFallback] = useState(false);
  const [audioErrorNotice, setAudioErrorNotice] = useState(null);

  // Determine streaming and download endpoints
  const audioSrc = resource?.audioUrl
    ? (resource.audioUrl.startsWith('http') ? resource.audioUrl : resourcesAPI.getAudioUrl(resource._id))
    : (resource?._id ? resourcesAPI.getAudioUrl(resource._id) : '');

  const downloadSrc = resource?.downloadUrl
    ? (resource.downloadUrl.startsWith('http') ? resource.downloadUrl : resourcesAPI.getDownloadUrl(resource._id))
    : (resource?._id ? resourcesAPI.getDownloadUrl(resource._id) : '');

  // Format seconds to mm:ss
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Sync playback rate with audio element or speech synthesis
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Clean-up speech synthesis and audio on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  if (!resource) return null;

  // Handle HTML5 Audio Events
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 180);
      setAudioErrorNotice(null);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleAudioError = (e) => {
    console.warn('[Audio Engine] Remote audio stream unreachable. Seamlessly activating Smart Offline Voice:', e);
    setIsUsingSpeechFallback(true);
    setAudioErrorNotice('Switched to Smart Offline Voice Engine');
  };

  // Toggle Play / Pause
  const togglePlay = () => {
    if (isUsingSpeechFallback) {
      if (isPlaying) {
        window.speechSynthesis.pause();
        setIsPlaying(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsPlaying(true);
        } else {
          window.speechSynthesis.cancel();
          const spokenText = resource.content || resource.description || resource.title;
          const utterance = new SpeechSynthesisUtterance(spokenText);
          utterance.rate = playbackRate;
          utterance.onend = () => {
            setIsPlaying(false);
            setCurrentTime(0);
          };
          utterance.onerror = () => setIsPlaying(false);
          window.speechSynthesis.speak(utterance);
          setIsPlaying(true);
        }
      }
      return;
    }

    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn('[Audio Engine] Autoplay/stream blocked, falling back to Web Speech:', err);
        setIsUsingSpeechFallback(true);
        const spokenText = resource.content || resource.description || resource.title;
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.rate = playbackRate;
        utterance.onend = () => setIsPlaying(false);
        window.speechSynthesis.speak(utterance);
        setIsPlaying(true);
      });
    }
  };

  // Scrub timeline
  const handleSeek = (e) => {
    const targetSeconds = Number(e.target.value);
    setCurrentTime(targetSeconds);
    if (!isUsingSpeechFallback && audioRef.current) {
      audioRef.current.currentTime = targetSeconds;
    }
  };

  // Cycle speed: 0.75x -> 1.0x -> 1.25x -> 0.75x
  const cycleSpeed = () => {
    const nextSpeed = playbackRate === 0.75 ? 1.0 : playbackRate === 1.0 ? 1.25 : 0.75;
    setPlaybackRate(nextSpeed);
    if (isUsingSpeechFallback && isPlaying) {
      // Re-trigger speech with updated rate
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(resource.content || resource.description);
      utterance.rate = nextSpeed;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Toggle Mute
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audioRef.current) {
      audioRef.current.muted = nextMuted;
    }
  };

  // Handle Download for Offline Village Study
  const handleDownload = () => {
    const downloadUrl = downloadSrc || resourcesAPI.getDownloadUrl(resource._id);
    const safeTitle = (resource.title || 'Lesson').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `GramShiksha_Class${resource.classLevel}_${resource.subject}_${safeTitle}.mp3`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content audio-modal" onClick={e => e.stopPropagation()}>
        {/* Hidden HTML5 Audio Engine */}
        {!isUsingSpeechFallback && (
          <audio
            ref={audioRef}
            src={audioSrc}
            preload="metadata"
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
            onError={handleAudioError}
          />
        )}

        <div className="modal-header">
          <div className="flex items-center gap-2">
            <span className="badge badge-audio">
              <Icon name="volume" size={14} /> Offline Audio Capsule
            </span>
            <span className="text-xs text-muted">
              {isUsingSpeechFallback
                ? '🔊 Smart Offline Voice'
                : '⚡ Low-Bandwidth Stream (<100 KB)'}
            </span>
          </div>
          <button className="btn-icon" onClick={onClose} title="Close Player">
            <Icon name="x-circle" size={20} />
          </button>
        </div>

        <div className="audio-body" style={{ padding: '1rem 1.25rem' }}>
          <div className="audio-hero">
            <div className="audio-disk-art" style={{ position: 'relative' }}>
              <Icon
                name="volume"
                size={36}
                color={isPlaying ? '#059669' : '#0284c7'}
              />
              {isPlaying && (
                <span
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '2px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: '#10b981',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }}
                  title="Playing"
                />
              )}
            </div>
            <h3 style={{ fontSize: '1.15rem', marginBottom: '0.25rem' }}>{resource.title}</h3>
            <p className="text-sm text-muted">
              Class {resource.classLevel} • {resource.subject} • {resource.duration} • File Size: {resource.downloadSize}
            </p>

            {isUsingSpeechFallback && (
              <div
                style={{
                  display: 'inline-block',
                  backgroundColor: '#fef3c7',
                  color: '#92400e',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '12px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  marginTop: '0.4rem'
                }}
              >
                🔊 Playing via Smart Offline Voice (Zero Network Required)
              </div>
            )}
          </div>

          <div className="audio-player-controls">
            {/* Interactive Range Timeline Bar */}
            <div className="progress-bar-container">
              <input
                type="range"
                min="0"
                max={duration || 180}
                value={currentTime}
                onChange={handleSeek}
                className="audio-slider"
                aria-label="Audio timeline scrub"
              />
              <div className="flex justify-between text-xs text-muted mt-1 font-mono">
                <span>{formatTime(currentTime)}</span>
                <span>{duration ? formatTime(duration) : (resource.duration || '03:30')}</span>
              </div>
            </div>

            {/* Core Playback Control Buttons */}
            <div className="control-buttons">
              {/* Playback Speed Pill */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={cycleSpeed}
                title="Change narration pace"
                style={{ minWidth: '80px', fontWeight: 600 }}
              >
                {playbackRate.toFixed(2).replace(/\.00$/, '')}x Speed
              </button>

              {/* Main Play / Pause Button */}
              <button
                type="button"
                className="btn btn-primary btn-round play-btn"
                onClick={togglePlay}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.65rem 1.5rem',
                  fontSize: '0.95rem'
                }}
              >
                <Icon name={isPlaying ? 'clock' : 'zap'} size={18} />
                <span>{isPlaying ? 'Pause' : 'Play Lesson'}</span>
              </button>

              {/* Mute / Unmute Button */}
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={toggleMute}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                <Icon name="volume" size={14} color={isMuted ? '#94a3b8' : 'currentColor'} />
                {isMuted ? ' Unmute' : ' Mute'}
              </button>
            </div>

            {/* Offline Download Action Button */}
            <div style={{ textAlign: 'center', marginTop: '0.5rem', marginBottom: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleDownload}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  borderColor: 'var(--primary)',
                  color: 'var(--primary)',
                  fontWeight: 600
                }}
              >
                <Icon name="download" size={14} />
                <span>💾 Download Audio (.mp3)</span>
                <span className="text-muted text-xs font-mono">({resource.downloadSize})</span>
              </button>
            </div>
          </div>

          {/* Read-Along Synchronized Transcript Section */}
          {resource.content && (
            <div className="audio-transcript-card">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
                <Icon name="file-text" size={16} color="var(--primary)" />
                <span>Read Along while listening:</span>
              </h4>
              <p
                className="transcript-text"
                style={{
                  maxHeight: '140px',
                  overflowY: 'auto',
                  paddingRight: '0.25rem',
                  fontSize: '0.85rem',
                  lineHeight: '1.6',
                  color: '#334155',
                  fontStyle: 'normal'
                }}
              >
                {resource.content}
              </p>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '0.75rem 1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Close Audio Player
          </button>
        </div>
      </div>
    </div>
  );
};

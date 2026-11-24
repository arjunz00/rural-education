import React, { useState, useEffect } from 'react';
import { Icon } from './Icons';

export const AudioPlayerModal = ({ resource, onClose }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(15);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    let timer;
    if (isPlaying) {
      timer = setInterval(() => {
        setProgress(prev => (prev >= 100 ? 0 : prev + 1));
      }, 500 / speed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  if (!resource) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content audio-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <span className="badge badge-audio">
              <Icon name="volume" size={14} /> Offline Audio Capsule
            </span>
            <span className="text-xs text-muted">Low-Bandwidth Optimized</span>
          </div>
          <button className="btn-icon" onClick={onClose}>
            <Icon name="x-circle" size={20} />
          </button>
        </div>

        <div className="audio-body">
          <div className="audio-hero">
            <div className="audio-disk-art">
              <Icon name="volume" size={40} color="#0284c7" />
            </div>
            <h3>{resource.title}</h3>
            <p className="text-sm text-muted">{resource.subject} • {resource.duration} • File Size: {resource.downloadSize}</p>
          </div>

          <div className="audio-player-controls">
            <div className="progress-bar-container">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={e => setProgress(Number(e.target.value))}
                className="audio-slider"
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>01:15</span>
                <span>{resource.duration || '04:30'}</span>
              </div>
            </div>

            <div className="control-buttons">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setSpeed(s => (s === 1 ? 1.25 : s === 1.25 ? 1.5 : 1))}
              >
                {speed}x Speed
              </button>
              <button
                className="btn btn-primary btn-round play-btn"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                <Icon name={isPlaying ? 'clock' : 'zap'} size={20} />
                {isPlaying ? 'Pause' : 'Play Lesson'}
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  alert(`Offline Packet saved! File size: ${resource.downloadSize}. Stored in local browser memory.`);
                }}
              >
                <Icon name="download" size={14} /> Save Offline
              </button>
            </div>
          </div>

          {resource.content && (
            <div className="audio-transcript-card">
              <h4>
                <Icon name="file-text" size={16} /> Spoken Lecture Transcript
              </h4>
              <p className="transcript-text">{resource.content}</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close Audio Player
          </button>
        </div>
      </div>
    </div>
  );
};

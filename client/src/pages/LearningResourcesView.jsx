import React, { useState, useEffect } from 'react';
import { resourcesAPI } from '../services/api';
import { Icon } from '../components/Icons';
import { AudioPlayerModal } from '../components/AudioPlayerModal';

export const LearningResourcesView = () => {
  const [resources, setResources] = useState([]);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [activeAudioResource, setActiveAudioResource] = useState(null);
  const [activeTextResource, setActiveTextResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await resourcesAPI.getAll();
      setResources(res.data || []);
    } catch (err) {
      console.error('Failed to load learning resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = resources.filter(r => {
    if (subjectFilter !== 'All' && r.subject !== subjectFilter) return false;
    if (typeFilter !== 'All' && r.resourceType !== typeFilter) return false;
    return true;
  });

  const subjects = ['All', ...new Set(resources.map(r => r.subject))];

  return (
    <div className="resources-page">
      <div className="dashboard-top-header">
        <div>
          <h2>📚 Low-Bandwidth Digital Study Packets & Audio Capsules</h2>
          <p className="text-sm text-muted">
            Optimized for rural mobile hotspot access • Lightweight files under 2 MB with audio playback & printable notes
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Subject Filter */}
          <select
            className="form-control"
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
          >
            {subjects.map(s => (
              <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            className="form-control"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="All">All Formats</option>
            <option value="audio">Audio Capsules (Spoken)</option>
            <option value="text">Text Cheat Sheets</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="portal-loading-state">
          <div className="spinner"></div>
          <p>Loading digital repository...</p>
        </div>
      ) : (
        <div className="resources-grid-container">
          {filtered.length === 0 ? (
            <div className="portal-section-card text-center py-5 text-muted">
              No learning resources match the selected criteria.
            </div>
          ) : (
            filtered.map((res, idx) => (
              <div key={res._id || idx} className="resource-card-full">
                <div className="resource-card-header">
                  <span className={`badge ${res.resourceType === 'audio' ? 'badge-audio' : 'badge-text'}`}>
                    <Icon name={res.resourceType === 'audio' ? 'volume' : 'file-text'} size={14} />
                    {res.resourceType.toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="file-size-pill font-mono">{res.downloadSize}</span>
                    <span className="duration-pill text-xs text-muted">{res.duration}</span>
                  </div>
                </div>

                <h3 className="resource-title">{res.title}</h3>
                <p className="resource-desc text-sm text-muted">{res.description}</p>

                <div className="resource-actions">
                  <span className="subject-tag font-semibold text-primary">{res.subject}</span>
                  {res.resourceType === 'audio' ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setActiveAudioResource(res)}
                    >
                      <Icon name="volume" size={14} /> Listen ({res.duration})
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => setActiveTextResource(res)}
                    >
                      <Icon name="file-text" size={14} /> Read Notes
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Audio Modal */}
      {activeAudioResource && (
        <AudioPlayerModal
          resource={activeAudioResource}
          onClose={() => setActiveAudioResource(null)}
        />
      )}

      {/* Text Reader Modal */}
      {activeTextResource && (
        <div className="modal-backdrop" onClick={() => setActiveTextResource(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Icon name="file-text" size={18} color="#0284c7" />
                <h3 className="font-bold">{activeTextResource.title}</h3>
              </div>
              <button className="btn-icon" onClick={() => setActiveTextResource(null)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div className="text-packet-meta mb-3">
                <span className="badge badge-primary">{activeTextResource.subject}</span>
                <span className="text-xs text-muted ml-2">File size: {activeTextResource.downloadSize} • Est. Read: {activeTextResource.duration}</span>
              </div>
              <div className="text-packet-content p-3 bg-light rounded font-mono text-sm whitespace-pre-wrap">
                {activeTextResource.content || 'Content available in offline memory.'}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveTextResource(null)}>
                Close Reader
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  window.print();
                }}
              >
                <Icon name="printer" size={14} /> Print Notes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

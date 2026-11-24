import React, { useState, useEffect } from 'react';
import { resourcesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/Icons';
import { AudioPlayerModal } from '../components/AudioPlayerModal';

export const LearningResourcesView = () => {
  const { currentUser, isStudent, isParent } = useAuth();

  // If student or parent is logged in, default directly to their assigned class; otherwise default to Class 8
  const defaultClass = currentUser?.assignedClass
    ? String(currentUser.assignedClass)
    : isStudent || isParent
    ? '8'
    : '8';

  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [resources, setResources] = useState([]);
  const [activeAudioResource, setActiveAudioResource] = useState(null);
  const [activeTextResource, setActiveTextResource] = useState(null);
  const [activeTextbookResource, setActiveTextbookResource] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchResources();
  }, [selectedClass, typeFilter]);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const params = {
        classLevel: Number(selectedClass)
      };
      if (typeFilter !== 'All') {
        params.resourceType = typeFilter;
      }
      const res = await resourcesAPI.getAll(params);
      setResources(res.data || []);
    } catch (err) {
      console.error('Failed to load learning resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectDownload = (res) => {
    const downloadUrl = res.downloadUrl || resourcesAPI.getDownloadUrl(res._id);
    const safeTitle = (res.title || 'Lesson').replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `GramShiksha_Class${res.classLevel}_${res.subject}_${safeTitle}.mp3`;
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const filtered = resources.filter(r => {
    if (subjectFilter !== 'All' && r.subject !== subjectFilter) return false;
    // Strict isolation enforcement: resource must belong to selectedClass
    if (Number(r.classLevel) !== Number(selectedClass)) return false;
    return true;
  });

  const subjects = ['All', ...new Set(resources.map(r => r.subject))];

  return (
    <div className="resources-page">
      <div className="dashboard-top-header">
        <div>
          <h2>📚 Class-Isolated Digital Study Packets & Audio Capsules</h2>
          <p className="text-sm text-muted">
            Strict State Board curriculum mapping • Authentic offline-ready study notes and audio capsules for Class {selectedClass}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Class Filter Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted font-bold">Class:</span>
            <select
              className="form-control"
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setSubjectFilter('All');
              }}
              style={{ minWidth: '110px', fontWeight: 'bold' }}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(c => (
                <option key={c} value={String(c)}>Class {c}</option>
              ))}
            </select>
          </div>

          {/* Subject Filter Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted font-bold">Subject:</span>
            <select
              className="form-control"
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
            >
              {subjects.map(s => (
                <option key={s} value={s}>{s === 'All' ? 'All Subjects' : s}</option>
              ))}
            </select>
          </div>

          {/* Format Filter Dropdown */}
          <div className="flex items-center gap-1">
            <span className="text-xs text-muted font-bold">Format:</span>
            <select
              className="form-control"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="All">All Formats</option>
              <option value="textbook">📖 Digital Textbooks (Balbharati)</option>
              <option value="audio">🎧 Audio Capsules (Spoken)</option>
              <option value="text">📄 Text Notes & Revision</option>
            </select>
          </div>
        </div>
      </div>

      {/* Class Indicator Bar */}
      <div className="grade-wings-container" style={{ margin: '0 0 1.25rem 0' }}>
        <div className="grade-wings-header">
          <span className="grade-wings-title">Class Level Active:</span>
          <span className="text-xs text-muted">
            Showing exclusively Class {selectedClass} materials ({filtered.length} resources)
          </span>
        </div>
        <div className="grade-wings-pills">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((clsNum) => {
            const isSelected = Number(selectedClass) === clsNum;
            return (
              <button
                key={clsNum}
                type="button"
                className={`class-pill-btn ${isSelected ? 'active' : ''}`}
                onClick={() => {
                  setSelectedClass(String(clsNum));
                  setSubjectFilter('All');
                }}
              >
                Class {clsNum}
              </button>
            );
          })}
        </div>
      </div>

      {isLoading ? (
        <div className="portal-loading-state">
          <div className="spinner"></div>
          <p>Loading Class {selectedClass} digital materials...</p>
        </div>
      ) : (
        <div className="resources-grid-container">
          {filtered.length === 0 ? (
            <div className="portal-section-card text-center py-5 text-muted" style={{ gridColumn: '1 / -1' }}>
              No learning resources found specifically for Class {selectedClass} with selected filters.
            </div>
          ) : (
            filtered.map((res, idx) => (
              <div key={res._id || idx} className="resource-card-full">
                <div className="resource-card-header">
                  <div className="flex items-center gap-2">
                    <span className={`badge ${res.resourceType === 'audio' ? 'badge-audio' : res.resourceType === 'textbook' ? 'badge-primary' : 'badge-text'}`}>
                      <Icon name={res.resourceType === 'audio' ? 'volume' : res.resourceType === 'textbook' ? 'book' : 'file-text'} size={14} />
                      {res.resourceType === 'audio' ? '🎧 Audio Capsule' : res.resourceType === 'textbook' ? '📖 Balbharati Textbook' : '📄 Text Notes'}
                    </span>
                    <span className="class-badge-pill" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>
                      Class {res.classLevel}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="file-size-pill font-mono">💾 {res.downloadSize}</span>
                    <span className="duration-pill text-xs text-muted">⏱️ {res.duration}</span>
                  </div>
                </div>

                <h3 className="resource-title">{res.title}</h3>
                {res.authorOrBoard && (
                  <p className="text-xs text-muted" style={{ fontStyle: 'italic', marginBottom: '0.25rem' }}>
                    🏛️ {res.authorOrBoard}
                  </p>
                )}
                <p className="resource-desc text-sm text-muted">{res.description}</p>

                <div className="resource-actions">
                  <span className="subject-tag font-semibold text-primary">{res.subject}</span>
                  {res.resourceType === 'audio' ? (
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => setActiveAudioResource(res)}
                      >
                        <Icon name="volume" size={14} /> ▶ Listen Lesson
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleDirectDownload(res)}
                        title="Download audio file for offline village study"
                      >
                        <Icon name="download" size={14} /> ⬇ Download ({res.downloadSize})
                      </button>
                    </div>
                  ) : res.resourceType === 'textbook' ? (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setActiveTextbookResource(res)}
                    >
                      <Icon name="book" size={14} /> 📖 Read Chapter
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
                <span className="class-badge-pill ml-2">Class {activeTextResource.classLevel}</span>
                <span className="text-xs text-muted ml-2">File size: {activeTextResource.downloadSize} • Est. Read: {activeTextResource.duration}</span>
              </div>
              <div className="text-packet-content" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, fontSize: '0.9rem' }}>
                {activeTextResource.content}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setActiveTextResource(null)}>
                Close Reader
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Digital Textbook / Balbharati E-Book Reader Modal */}
      {activeTextbookResource && (
        <div className="modal-backdrop" onClick={() => setActiveTextbookResource(null)}>
          <div className="modal-content" style={{ maxWidth: '780px', maxHeight: '88vh' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ borderBottom: '2px solid var(--primary-light)' }}>
              <div className="flex items-center gap-2">
                <Icon name="book" size={20} color="#4f46e5" />
                <div>
                  <h3 className="font-bold" style={{ margin: 0 }}>{activeTextbookResource.title}</h3>
                  <span className="text-xs text-muted">
                    {activeTextbookResource.authorOrBoard || 'Maharashtra State Bureau of Textbook Production (Balbharati)'}
                  </span>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setActiveTextbookResource(null)}>
                <Icon name="x-circle" size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ overflowY: 'auto' }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3 pb-2 border-b">
                <div className="flex items-center gap-2">
                  <span className="badge badge-primary">{activeTextbookResource.subject}</span>
                  <span className="class-badge-pill font-bold">Class {activeTextbookResource.classLevel}</span>
                  <span className="badge badge-outline">Standard Curriculum</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span>💾 {activeTextbookResource.downloadSize}</span>
                  <span>•</span>
                  <span>⏱️ Read time: {activeTextbookResource.duration}</span>
                </div>
              </div>

              <div
                className="textbook-reader-content"
                style={{
                  whiteSpace: 'pre-wrap',
                  lineHeight: 1.7,
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  padding: '1rem',
                  backgroundColor: '#fcfcfd',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontFamily: 'serif'
                }}
              >
                {activeTextbookResource.content}
              </div>
            </div>
            <div className="modal-footer flex justify-between items-center">
              <span className="text-xs text-muted">
                Offline-ready • NCERT & State Board Aligned
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => window.print()}
                >
                  <Icon name="printer" size={14} /> Print Chapter
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setActiveTextbookResource(null)}
                >
                  Close Reader
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Also export as Resources for convenience
export const Resources = LearningResourcesView;

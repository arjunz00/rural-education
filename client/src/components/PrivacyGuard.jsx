import React from 'react';
import { Icon } from './Icons';

export const PrivacyGuard = ({
  title = '🔒 Student Data Privacy Protection',
  message,
  onReturn
}) => {
  const defaultMessage =
    "Under institutional student data privacy guidelines, individual student risk assessments, full directories, and other children's academic records are restricted. You are only authorized to view records for your linked student.";

  const handleReturn = () => {
    if (onReturn) {
      onReturn();
    } else {
      window.location.hash = '#/';
    }
  };

  return (
    <div className="privacy-guard-backdrop">
      <div className="privacy-guard-card">
        <div className="privacy-shield-icon">
          <Icon name="lock" size={48} color="#dc2626" />
        </div>

        <h2 className="privacy-guard-title">{title}</h2>

        <div className="privacy-badge">
          <Icon name="shield" size={14} /> Strict Institutional RBAC Boundary Enforced
        </div>

        <p className="privacy-guard-message">
          {message || defaultMessage}
        </p>

        <div className="privacy-notice-box">
          <p className="text-xs text-muted">
            <strong>Legal Notice:</strong> In compliance with Right to Education (RTE) guidelines and child data confidentiality standards, access attempts to unauthorized learner files are logged with cryptographic audit timestamps.
          </p>
        </div>

        <div className="privacy-action-wrap">
          <button className="btn btn-primary btn-lg" onClick={handleReturn}>
            <Icon name="arrow-left" size={18} /> ← Return to My Safe Portal
          </button>
        </div>
      </div>
    </div>
  );
};

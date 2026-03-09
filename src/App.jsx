
import React, { useState, useEffect } from 'react';

// STAGE 1: Centralized Configuration & Sample Data
const ROLES = {
  'Policyholder': {
    canSubmit: true,
    canViewOwnClaims: true,
    canViewAllClaims: false,
    canApproveReject: false,
    canEditClaim: false,
    canViewAuditLogs: false,
    canViewSLA: false,
    canAccessAdminDashboard: false,
  },
  'Claims Officer': {
    canSubmit: false,
    canViewOwnClaims: true, // For claims they are assigned to
    canViewAllClaims: true,
    canApproveReject: true,
    canEditClaim: true,
    canViewAuditLogs: true,
    canViewSLA: true,
    canAccessAdminDashboard: false,
  },
  'Claims Manager': {
    canSubmit: false,
    canViewOwnClaims: false,
    canViewAllClaims: true,
    canApproveReject: true,
    canEditClaim: true,
    canViewAuditLogs: true,
    canViewSLA: true,
    canAccessAdminDashboard: true,
  },
  'Verification Team': {
    canSubmit: false,
    canViewOwnClaims: false,
    canViewAllClaims: true, // Can view claims needing verification
    canApproveReject: false,
    canEditClaim: true, // To update verification status/details
    canViewAuditLogs: true,
    canViewSLA: false,
    canAccessAdminDashboard: false,
  },
  'Finance Team': {
    canSubmit: false,
    canViewOwnClaims: false,
    canViewAllClaims: true, // Can view approved claims for payout
    canApproveReject: false,
    canEditClaim: true, // To update payment status
    canViewAuditLogs: true,
    canViewSLA: false,
    canAccessAdminDashboard: false,
  },
};

const NAV_ITEMS = {
  'DASHBOARD': { label: 'Dashboard', roles: ['Claims Manager', 'Claims Officer'] },
  'CLAIMS_LIST': { label: 'All Claims', roles: ['Claims Officer', 'Claims Manager', 'Verification Team', 'Finance Team'] },
  'MY_CLAIMS': { label: 'My Claims', roles: ['Policyholder'] },
  'REPORTS': { label: 'Reports', roles: ['Claims Manager'] },
};

const STATUS_MAP = {
  'Approved': { bgColor: 'var(--status-approved-bg)', borderColor: 'var(--status-approved-border)', textColor: 'var(--status-approved-text)' },
  'In Progress': { bgColor: 'var(--status-in-progress-bg)', borderColor: 'var(--status-in-progress-border)', textColor: 'var(--status-in-progress-text)' },
  'Pending': { bgColor: 'var(--status-pending-bg)', borderColor: 'var(--status-pending-border)', textColor: 'var(--status-pending-text)' },
  'Rejected': { bgColor: 'var(--status-rejected-bg)', borderColor: 'var(--status-rejected-border)', textColor: 'var(--status-rejected-text)' },
  'Exception': { bgColor: 'var(--status-exception-bg)', borderColor: 'var(--status-exception-border)', textColor: 'var(--status-exception-text)' },
};

const sampleClaims = [
  {
    id: 'CLM-001-2023',
    policyholder: 'Alice Johnson',
    type: 'Auto Accident',
    amount: 15000,
    status: 'Approved',
    submittedDate: '2023-01-15',
    lastUpdated: '2023-01-28',
    details: 'Rear-end collision, minor injuries, vehicle damage to front bumper.',
    documents: [{ name: 'Police Report.pdf', url: '#', type: 'pdf' }, { name: 'Repair Estimate.docx', url: '#', type: 'doc' }],
    relatedRecords: [{ type: 'Policy', id: 'POL-A789' }, { type: 'Vehicle', id: 'VHC-XYZ123' }],
    workflow: [
      { stage: 'Submission', status: 'completed', date: '2023-01-15', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Initial Review', status: 'completed', date: '2023-01-17', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Verification', status: 'completed', date: '2023-01-20', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Approval', status: 'completed', date: '2023-01-25', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Payout', status: 'completed', date: '2023-01-28', sla: { status: 'on-track', daysLeft: 0 } },
    ],
  },
  {
    id: 'CLM-002-2023',
    policyholder: 'Bob Williams',
    type: 'Property Damage',
    amount: 5000,
    status: 'In Progress',
    submittedDate: '2023-02-01',
    lastUpdated: '2023-02-05',
    details: 'Water damage from burst pipe in kitchen. Pictures attached.',
    documents: [{ name: 'Incident Photos.zip', url: '#', type: 'zip' }, { name: 'Repair Quote.xlsx', url: '#', type: 'xls' }],
    relatedRecords: [{ type: 'Policy', id: 'POL-B123' }],
    workflow: [
      { stage: 'Submission', status: 'completed', date: '2023-02-01', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Initial Review', status: 'completed', date: '2023-02-03', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Verification', status: 'current', date: '2023-02-05', sla: { status: 'on-track', daysLeft: 2 } },
      { stage: 'Approval', status: 'pending', sla: { status: 'not-started', daysLeft: 5 } },
      { stage: 'Payout', status: 'pending', sla: { status: 'not-started', daysLeft: 8 } },
    ],
  },
  {
    id: 'CLM-003-2023',
    policyholder: 'Charlie Davis',
    type: 'Medical Expense',
    amount: 1200,
    status: 'Pending',
    submittedDate: '2023-02-10',
    lastUpdated: '2023-02-12',
    details: 'Emergency room visit for sprained ankle. Medical bills uploaded.',
    documents: [{ name: 'Medical Bills.pdf', url: '#', type: 'pdf' }],
    relatedRecords: [{ type: 'Policy', id: 'POL-C456' }],
    workflow: [
      { stage: 'Submission', status: 'completed', date: '2023-02-10', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Initial Review', status: 'current', date: '2023-02-12', sla: { status: 'breached', daysLeft: -1 } },
      { stage: 'Verification', status: 'pending', sla: { status: 'not-started', daysLeft: 3 } },
      { stage: 'Approval', status: 'pending', sla: { status: 'not-started', daysLeft: 6 } },
      { stage: 'Payout', status: 'pending', sla: { status: 'not-started', daysLeft: 9 } },
    ],
  },
  {
    id: 'CLM-004-2023',
    policyholder: 'Diana Miller',
    type: 'Theft',
    amount: 7500,
    status: 'Rejected',
    submittedDate: '2023-01-05',
    lastUpdated: '2023-01-10',
    details: 'Theft of bicycle. Claim rejected due to insufficient proof of ownership.',
    documents: [{ name: 'Police Report.pdf', url: '#', type: 'pdf' }, { name: 'Purchase Receipt.jpg', url: '#', type: 'jpg' }],
    relatedRecords: [{ type: 'Policy', id: 'POL-D789' }],
    workflow: [
      { stage: 'Submission', status: 'completed', date: '2023-01-05', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Initial Review', status: 'completed', date: '2023-01-07', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Verification', status: 'completed', date: '2023-01-09', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Rejection', status: 'completed', date: '2023-01-10', sla: { status: 'on-track', daysLeft: 0 } },
    ],
  },
  {
    id: 'CLM-005-2023',
    policyholder: 'Eve Brown',
    type: 'Travel Cancellation',
    amount: 2500,
    status: 'Exception',
    submittedDate: '2023-02-15',
    lastUpdated: '2023-02-17',
    details: 'Flight cancellation due to unforeseen circumstances. Requires manual override for review.',
    documents: [{ name: 'Flight Ticket.pdf', url: '#', type: 'pdf' }, { name: 'Cancellation Notice.pdf', url: '#', type: 'pdf' }],
    relatedRecords: [{ type: 'Policy', id: 'POL-E012' }],
    workflow: [
      { stage: 'Submission', status: 'completed', date: '2023-02-15', sla: { status: 'on-track', daysLeft: 0 } },
      { stage: 'Initial Review', status: 'current', date: '2023-02-17', sla: { status: 'on-track', daysLeft: 1 } },
      { stage: 'Special Review', status: 'pending', sla: { status: 'not-started', daysLeft: 4 } }, // Custom stage for Exception
      { stage: 'Approval', status: 'pending', sla: { status: 'not-started', daysLeft: 7 } },
      { stage: 'Payout', status: 'pending', sla: { status: 'not-started', daysLeft: 10 } },
    ],
  },
];

const sampleAuditLog = [
  { id: 1, timestamp: '2023-02-17 14:30', user: 'System', action: 'Claim CLM-005-2023 moved to Exception status.', role: 'System' },
  { id: 2, timestamp: '2023-02-17 10:15', user: 'John Doe (Claims Officer)', action: 'Reviewed claim CLM-005-2023, flagged for exception due to missing document clarity.', role: 'Claims Officer' },
  { id: 3, timestamp: '2023-02-12 11:45', user: 'Jane Smith (Claims Officer)', action: 'SLA breached for Initial Review on claim CLM-003-2023.', role: 'System' },
  { id: 4, timestamp: '2023-02-12 10:00', user: 'Charlie Davis (Policyholder)', action: 'Submitted claim CLM-003-2023 for Medical Expense.', role: 'Policyholder' },
];

// STAGE 2: Core Components

// Icon component (simple SVG placeholder)
const Icon = ({ name, className = '', size = '1em' }) => (
  <span className={`icon icon-${name} ${className}`} style={{ width: size, height: size }}></span>
);

// Claim Card Component
const ClaimCard = ({ claim, onClick }) => {
  const statusConfig = STATUS_MAP[claim.status] || {};
  return (
    <div
      className="claim-card"
      style={{
        borderLeftColor: statusConfig?.borderColor || 'var(--border-color)',
        backgroundColor: 'var(--bg-card)',
      }}
      onClick={() => onClick(claim.id)}
    >
      <div className="card-content">
        <div className="card-header">
          <span className="claim-id">{claim.id}</span>
          <span className={`status-tag status-${claim.status?.replace(/\s/g, '')}`}>{claim.status}</span>
        </div>
        <p className="policyholder-info">{claim.policyholder} - {claim.type}</p>
        <p className="amount">${claim.amount?.toLocaleString()}</p>
        <p className="date-info">Submitted: {claim.submittedDate}</p>
      </div>
    </div>
  );
};

// Milestone Tracker Component
const MilestoneTracker = ({ workflowStages }) => {
  return (
    <div className="milestone-tracker">
      {workflowStages?.map((stage, index) => (
        <div key={index} className="milestone-item">
          <div className={`milestone-dot ${stage.status}`}>
            {stage.status === 'completed' && <Icon name="check" size="0.75em" />}
            {stage.status === 'current' && <Icon name="clock" size="0.75em" />}
          </div>
          <div className="milestone-content">
            <span className="milestone-title">{stage.stage}</span>
            {stage.date && <span className="milestone-date"> ({stage.date})</span>}
            {stage.sla?.status === 'on-track' && (
              <span className="milestone-sla on-track">On Track</span>
            )}
            {stage.sla?.status === 'breached' && (
              <span className="milestone-sla breached">SLA Breached!</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// Audit Feed Component
const AuditFeed = ({ auditLogs, userRole }) => {
  const filteredLogs = auditLogs?.filter(log => {
    // RBAC logic for logs: Claims Manager sees all, others only relevant logs
    if (userRole === 'Claims Manager') return true;
    if (userRole === 'Policyholder' && log.role === 'Policyholder') return true;
    if (userRole === 'Claims Officer' && (log.role === 'Claims Officer' || log.role === 'System')) return true;
    return false; // Default to hide
  });

  return (
    <div className="audit-feed-list">
      {filteredLogs?.length === 0 ? (
        <p className="text-muted">No audit entries visible for your role.</p>
      ) : (
        filteredLogs?.map(log => (
          <div key={log.id} className="audit-item">
            <div className="audit-meta">
              <span>{log.user}</span>
              <span>{log.timestamp}</span>
            </div>
            <p className="audit-description">{log.action}</p>
          </div>
        ))
      )}
    </div>
  );
};

// Dashboard Screen Component
const DashboardScreen = ({ onCardClick, userRole, rolesConfig }) => {
  // Filter claims based on user role for 'Recent Claims'
  const allowedClaims = sampleClaims?.filter(claim => {
    if (rolesConfig[userRole]?.canViewAllClaims) return true;
    if (rolesConfig[userRole]?.canViewOwnClaims && claim.policyholder === 'Alice Johnson') return true; // Placeholder for 'own claims' logic
    return false;
  });

  const totalClaims = allowedClaims?.length || 0;
  const approvedClaims = allowedClaims?.filter(c => c.status === 'Approved').length || 0;
  const inProgressClaims = allowedClaims?.filter(c => c.status === 'In Progress').length || 0;
  const pendingClaims = allowedClaims?.filter(c => c.status === 'Pending').length || 0;
  const rejectedClaims = allowedClaims?.filter(c => c.status === 'Rejected').length || 0;

  if (!rolesConfig[userRole]?.canAccessAdminDashboard) {
    return (
      <div className="main-content">
        <h2>Access Denied</h2>
        <p>You do not have permission to view the dashboard.</p>
      </div>
    );
  }

  return (
    <div className="dashboard-screen">
      <h2>Claims Overview</h2>

      <div className="dashboard-grid">
        <div className="kpi-card">
          <span className="kpi-label">Total Claims</span>
          <span className="kpi-value">{totalClaims}</span>
          <div className="kpi-trend positive"><Icon name="up-arrow" /> 5% vs last month</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Approved Claims</span>
          <span className="kpi-value">{approvedClaims}</span>
          <div className="kpi-trend positive"><Icon name="up-arrow" /> 8% vs last month</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">In Progress</span>
          <span className="kpi-value">{inProgressClaims}</span>
          <div className="kpi-trend"><Icon name="clock" /> Stable</div>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Pending Review</span>
          <span className="kpi-value">{pendingClaims}</span>
          <div className="kpi-trend negative"><Icon name="down-arrow" /> 2% vs last month</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Claims by Type (Donut)</h3>
          <div className="chart-placeholder">Donut Chart Placeholder</div>
          <p className="text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>AI-powered Insight: Auto Accident claims are showing a slight increase in frequency.</p>
        </div>
        <div className="chart-card">
          <h3>Claim Status Trends (Line)</h3>
          <div className="chart-placeholder">Line Chart Placeholder</div>
          <p className="text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>AI-powered Insight: Rejection rates peaked last quarter due to verification bottlenecks.</p>
        </div>
        <div className="chart-card">
          <h3>Average Processing Time (Gauge)</h3>
          <div className="chart-placeholder">Gauge Chart Placeholder</div>
          <p className="text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>AI-powered Insight: Processing time for Property Damage claims is currently above target.</p>
        </div>
        <div className="chart-card">
          <h3>SLA Breaches by Stage (Bar)</h3>
          <div className="chart-placeholder">Bar Chart Placeholder</div>
          <p className="text-muted" style={{ marginTop: 'var(--spacing-sm)' }}>AI-powered Insight: Initial Review stage accounts for 60% of all SLA breaches.</p>
        </div>
      </div>

      <div className="flex-row-between" style={{ marginBottom: 'var(--spacing-md)' }}>
        <h3>Recent Claims</h3>
        <button className="button-primary" onClick={() => onCardClick(null, 'CLAIMS_LIST')}>View All Claims</button>
      </div>
      <div className="claims-grid">
        {allowedClaims?.slice(0, 4)?.map(claim => (
          <ClaimCard key={claim.id} claim={claim} onClick={onCardClick} />
        ))}
      </div>
      {allowedClaims?.length === 0 && (
        <div className="detail-section-card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <h3>No claims to display</h3>
          <p className="text-muted">It looks like there are no recent claims for your role.</p>
          {userRole === 'Policyholder' && (
            <button className="button-primary" style={{ marginTop: 'var(--spacing-md)' }}>Submit New Claim</button>
          )}
        </div>
      )}
    </div>
  );
};

// Claims List Screen Component
const ClaimsListScreen = ({ onCardClick, userRole, rolesConfig }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortKey, setSortKey] = useState('submittedDate');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  const availableClaims = sampleClaims?.filter(claim => {
    if (rolesConfig[userRole]?.canViewAllClaims) return true;
    if (rolesConfig[userRole]?.canViewOwnClaims && claim.policyholder === 'Alice Johnson') return true; // Placeholder
    return false;
  });

  const filteredAndSortedClaims = availableClaims
    ?.filter(claim => {
      const matchesSearch = claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.policyholder.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.type.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || claim.status === filterStatus;
      return matchesSearch && matchesStatus;
    })
    ?.sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (typeof aValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const hasAccess = rolesConfig[userRole]?.canViewAllClaims || rolesConfig[userRole]?.canViewOwnClaims;

  if (!hasAccess) {
    return (
      <div className="main-content">
        <h2>Access Denied</h2>
        <p>You do not have permission to view claims lists.</p>
      </div>
    );
  }

  return (
    <div className="claims-list-screen">
      <h2>{userRole === 'Policyholder' ? 'My Claims' : 'All Claims'}</h2>

      <div className="flex-row-between" style={{ marginBottom: 'var(--spacing-md)' }}>
        <input
          type="text"
          placeholder="Search claims..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', width: '300px' }}
        />
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: 'var(--spacing-sm)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
          >
            <option value="All">All Statuses</option>
            {Object.keys(STATUS_MAP).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button onClick={() => handleSort('submittedDate')} className="button-primary">
            Sort by Date {sortKey === 'submittedDate' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </button>
          <button onClick={() => handleSort('amount')} className="button-primary">
            Sort by Amount {sortKey === 'amount' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
          </button>
        </div>
      </div>

      <div className="claims-grid">
        {filteredAndSortedClaims?.length > 0 ? (
          filteredAndSortedClaims?.map(claim => (
            <ClaimCard key={claim.id} claim={claim} onClick={onCardClick} />
          ))
        ) : (
          <div className="detail-section-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <h3>No claims found</h3>
            <p className="text-muted">Try adjusting your search or filters.</p>
            {(userRole === 'Policyholder' && !searchTerm && filterStatus === 'All') && (
              <button className="button-primary" style={{ marginTop: 'var(--spacing-md)' }}>Submit New Claim</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Claim Detail Screen Component (Appian Record Alignment)
const ClaimDetailScreen = ({ claimId, onNavigateBack, userRole, rolesConfig }) => {
  const claim = sampleClaims?.find(c => c.id === claimId);

  // RBAC logic for viewing details
  const hasAccess = rolesConfig[userRole]?.canViewAllClaims ||
                    (rolesConfig[userRole]?.canViewOwnClaims && claim?.policyholder === 'Alice Johnson'); // Placeholder

  if (!hasAccess) {
    return (
      <div className="main-content">
        <h2>Access Denied</h2>
        <p>You do not have permission to view details for this claim.</p>
        <button className="button-primary" onClick={onNavigateBack} style={{ marginTop: 'var(--spacing-md)' }}>Back to Claims</button>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="main-content">
        <h2>Claim Not Found</h2>
        <p>The claim with ID {claimId} does not exist or you do not have access.</p>
        <button className="button-primary" onClick={onNavigateBack} style={{ marginTop: 'var(--spacing-md)' }}>Back to Claims</button>
      </div>
    );
  }

  const claimAuditLogs = sampleAuditLog?.filter(log => log.action?.includes(claim.id));

  return (
    <div className="claim-detail-screen">
      <div className="breadcrumbs">
        <button onClick={onNavigateBack} style={{ background: 'none', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}>Claims</button>
        <span>/</span>
        <span>{claim.id}</span>
      </div>

      <div className="flex-row-between" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <h2>Claim: {claim.id}</h2>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
          {rolesConfig[userRole]?.canEditClaim && (
            <button className="button-primary">Edit Claim</button>
          )}
          {rolesConfig[userRole]?.canApproveReject && (
            <>
              {claim.status !== 'Approved' && claim.status !== 'Rejected' && (
                <button className="button-primary" style={{ backgroundColor: 'var(--status-approved-border)' }}>Approve</button>
              )}
              {claim.status !== 'Approved' && claim.status !== 'Rejected' && (
                <button className="button-primary" style={{ backgroundColor: 'var(--status-rejected-border)' }}>Reject</button>
              )}
            </>
          )}
        </div>
      </div>

      <div className="claim-detail-layout">
        <div className="claim-detail-main">
          {/* Record Summary Page Section */}
          <div className="detail-section-card">
            <h3>Claim Summary</h3>
            <p><strong>Policyholder:</strong> {claim.policyholder}</p>
            <p><strong>Type:</strong> {claim.type}</p>
            <p><strong>Amount:</strong> ${claim.amount?.toLocaleString()}</p>
            <p><strong>Status:</strong> <span className={`status-tag status-${claim.status?.replace(/\s/g, '')}`}>{claim.status}</span></p>
            <p><strong>Submitted Date:</strong> {claim.submittedDate}</p>
            <p><strong>Last Updated:</strong> {claim.lastUpdated}</p>
            <p style={{ marginTop: 'var(--spacing-sm)' }}><strong>Details:</strong> {claim.details}</p>
          </div>

          {/* Related Documents Section */}
          <div className="detail-section-card">
            <h3>Supporting Documents</h3>
            {claim.documents?.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {claim.documents?.map((doc, index) => (
                  <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                    <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      {doc.name} ({doc.type?.toUpperCase()})
                    </a>
                    {/* Document preview would open in a modal/new tab */}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No documents uploaded.</p>
            )}
          </div>

          {/* Related Records Section */}
          <div className="detail-section-card">
            <h3>Related Records</h3>
            {claim.relatedRecords?.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {claim.relatedRecords?.map((record, index) => (
                  <li key={index} style={{ marginBottom: 'var(--spacing-xs)' }}>
                    <a href="#" style={{ color: 'var(--primary-color)', textDecoration: 'none' }}>
                      {record.type}: {record.id}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted">No related records.</p>
            )}
          </div>
        </div>

        <div className="claim-detail-sidebar">
          {/* Milestone Tracker (Workflow Progress) */}
          <div className="detail-section-card">
            <h3>Workflow Progress</h3>
            {rolesConfig[userRole]?.canViewSLA ? (
              <MilestoneTracker workflowStages={claim.workflow} />
            ) : (
              <p className="text-muted">You do not have permission to view workflow SLA details.</p>
            )}
          </div>

          {/* News/Audit Feed */}
          <div className="detail-section-card">
            <h3>Audit Feed</h3>
            {rolesConfig[userRole]?.canViewAuditLogs ? (
              <AuditFeed auditLogs={claimAuditLogs} userRole={userRole} />
            ) : (
              <p className="text-muted">You do not have permission to view audit logs.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Global Search Component
const GlobalSearch = ({ isVisible, onClose }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    if (query.length > 2) {
      const filteredSuggestions = sampleClaims
        .filter(c => c.id.toLowerCase().includes(query.toLowerCase()) || c.policyholder.toLowerCase().includes(query.toLowerCase()))
        .map(c => ({ id: c.id, text: `${c.id} - ${c.policyholder}` }));
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSelectSuggestion = (id) => {
    // This would typically navigate to the detail view
    console.log(`Navigating to ${id}`);
    setQuery('');
    setSuggestions([]);
    onClose();
  };

  return (
    <div className={`global-search ${isVisible ? 'visible' : ''}`}>
      <Icon name="search" size="1.2em" className="search-icon" />
      <input
        type="text"
        placeholder="Search claims, policies, documents..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query.length > 0 && (
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: 'var(--text-light)' }}>&times;</button>
      )}

      {suggestions.length > 0 && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-card)', boxShadow: 'var(--shadow-md)', borderRadius: '0 0 var(--radius-lg) var(--radius-lg)', maxHeight: '200px', overflowY: 'auto', borderTop: '1px solid var(--border-color)' }}>
          {suggestions.map(s => (
            <div
              key={s.id}
              onClick={() => handleSelectSuggestion(s.id)}
              style={{ padding: 'var(--spacing-sm) var(--spacing-md)', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', '&:hover': { backgroundColor: 'var(--bg-main)' } }}
            >
              {s.text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// STAGE 3: Main Application Component
function App() {
  const [view, setView] = useState({ screen: 'DASHBOARD', params: {} });
  const [userRole, setUserRole] = useState('Claims Manager'); // Default role for testing
  const [isSearchVisible, setIsSearchVisible] = useState(false);

  const handleNavigation = (screenName, params = {}) => {
    // State Immutability: functional updates with spread operator
    setView(prevState => ({ ...prevState, screen: screenName, params: params }));
  };

  const handleClaimCardClick = (claimId, targetScreen = 'CLAIM_DETAIL') => {
    handleNavigation(targetScreen, { claimId });
  };

  const handleBackToClaims = () => {
    handleNavigation('CLAIMS_LIST');
  };

  const handleRoleChange = (e) => {
    setUserRole(e.target.value);
    // Reset view to dashboard or claims list based on new role's permissions
    if (ROLES[e.target.value]?.canAccessAdminDashboard) {
      handleNavigation('DASHBOARD');
    } else if (ROLES[e.target.value]?.canViewOwnClaims || ROLES[e.target.value]?.canViewAllClaims) {
      handleNavigation('CLAIMS_LIST');
    } else {
      handleNavigation('DASHBOARD'); // Fallback, perhaps an "Access Denied" screen
    }
  };

  // RBAC for navigation items
  const accessibleNavItems = Object.entries(NAV_ITEMS).filter(([key, item]) =>
    item.roles.includes(userRole)
  );

  const toggleSearch = () => {
    setIsSearchVisible(prev => !prev);
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="logo">Insurance Claim System</div>
        <nav>
          <ul>
            {accessibleNavItems?.map(([key, item]) => (
              <li key={key}>
                <button
                  className={view.screen === key ? 'active' : ''}
                  onClick={() => handleNavigation(key)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="user-info">
          <button onClick={toggleSearch} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-main)' }}>
            <Icon name="search" size="1.2em" />
          </button>
          <Icon name="user" size="1.2em" style={{ color: 'var(--text-light)' }} />
          <select value={userRole} onChange={handleRoleChange} className="role-selector">
            {Object.keys(ROLES).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>
      </header>

      <main className="main-content">
        {view.screen === 'DASHBOARD' && (
          <DashboardScreen
            onCardClick={handleClaimCardClick}
            userRole={userRole}
            rolesConfig={ROLES}
          />
        )}
        {view.screen === 'CLAIMS_LIST' && (
          <ClaimsListScreen
            onCardClick={handleClaimCardClick}
            userRole={userRole}
            rolesConfig={ROLES}
          />
        )}
        {view.screen === 'MY_CLAIMS' && (
          // This would ideally be a filtered ClaimsListScreen for the Policyholder
          <ClaimsListScreen
            onCardClick={handleClaimCardClick}
            userRole={userRole}
            rolesConfig={ROLES}
          />
        )}
        {view.screen === 'CLAIM_DETAIL' && (
          <ClaimDetailScreen
            claimId={view.params?.claimId}
            onNavigateBack={handleBackToClaims}
            userRole={userRole}
            rolesConfig={ROLES}
          />
        )}
        {view.screen === 'REPORTS' && (
          <div className="detail-section-card">
            <h2>Reports</h2>
            <p>Reports section under construction. (Role-based access applies)</p>
          </div>
        )}
        {/* Placeholder for other screens like 'Settings', 'Admin', etc. */}
      </main>

      <GlobalSearch isVisible={isSearchVisible} onClose={() => setIsSearchVisible(false)} />
    </div>
  );
}

export default App;
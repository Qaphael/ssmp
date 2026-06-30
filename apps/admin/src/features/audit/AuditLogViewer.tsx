import React, { useState, useMemo, useEffect } from 'react';
import { AuditLog } from '@ssmp/shared-types';
import { FileText, ChevronDown, ChevronRight, Search, Filter } from 'lucide-react';
import { mockDb } from '../../shared/api/mockDb';

interface AuditLogViewerProps {
  auditLogs: AuditLog[];
}

const ENTITY_COLORS: Record<string, string> = {
  team: 'bg-blue-100 text-blue-800',
  player: 'bg-green-100 text-green-800',
  competition: 'bg-purple-100 text-purple-800',
  match: 'bg-orange-100 text-orange-800',
  fixture: 'bg-yellow-100 text-yellow-800',
  organization: 'bg-red-100 text-red-800',
  season: 'bg-teal-100 text-teal-800',
  transfer_request: 'bg-indigo-100 text-indigo-800',
  match_event: 'bg-pink-100 text-pink-800',
};

const ACTION_LABELS: Record<string, string> = {
  'organization:create': 'Created organization',
  'organization:update': 'Updated organization',
  'organization:delete': 'Deleted organization',
  'season:create': 'Created season',
  'season:update': 'Updated season',
  'season:archive': 'Archived season',
  'season:delete': 'Deleted season',
  'competition:create': 'Created competition',
  'competition:update': 'Updated competition',
  'competition:delete': 'Deleted competition',
  'team:create': 'Created team',
  'team:update': 'Updated team',
  'team:assign-coach': 'Assigned coach',
  'team:approve-registration': 'Approved registration',
  'team:approve-roster': 'Approved roster',
  'team:delete': 'Deleted team',
  'player:create': 'Created player',
  'player:update': 'Updated player',
  'player:update-injury': 'Updated injury',
  'player:clear-injury': 'Cleared injury',
  'player:delete': 'Deleted player',
  'fixture:create': 'Created fixture',
  'fixture:bulk-create': 'Bulk created fixtures',
  'fixture:update': 'Updated fixture',
  'fixture:delete': 'Deleted fixture',
  'fixture:generate-round-robin': 'Generated round-robin',
  'match:create': 'Created match',
  'match:update-status': 'Updated match status',
  'match:assign-official': 'Assigned official',
  'match:submit-report': 'Submitted report',
  'match:verify': 'Verified match',
  'match:publish': 'Published match',
  'match:walkover': 'Recorded walkover',
  'match:postpone': 'Postponed match',
  'match:record-event': 'Recorded match event',
  'transfer:create': 'Created transfer request',
  'transfer:approved': 'Approved transfer',
  'transfer:rejected': 'Rejected transfer',
};

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function ChangesDiff({ oldValue, newValue }: { oldValue?: Record<string, unknown> | null; newValue?: Record<string, unknown> | null }) {
  if (!oldValue && !newValue) return <span className="text-gray-400 text-xs">No details</span>;

  const oldKeys = oldValue ? Object.keys(oldValue) : [];
  const newKeys = newValue ? Object.keys(newValue) : [];
  const allKeys = [...new Set([...oldKeys, ...newKeys])];

  return (
    <div className="space-y-0.5">
      {allKeys.slice(0, 5).map((key) => {
        const ov = oldValue?.[key];
        const nv = newValue?.[key];
        if (JSON.stringify(ov) === JSON.stringify(nv)) return null;
        return (
          <div key={key} className="text-xs font-mono">
            <span className="text-gray-500">{key}: </span>
            {ov !== undefined && <span className="text-red-600 line-through">{JSON.stringify(ov)}</span>}
            {ov !== undefined && nv !== undefined && <span className="text-gray-400"> {'\u2192'} </span>}
            {nv !== undefined && <span className="text-green-600">{JSON.stringify(nv)}</span>}
          </div>
        );
      })}
      {allKeys.length > 5 && (
        <span className="text-xs text-gray-400">+{allKeys.length - 5} more fields</span>
      )}
    </div>
  );
}

export default function AuditLogViewer({ auditLogs: propLogs }: AuditLogViewerProps) {
  const [localLogs, setLocalLogs] = useState<AuditLog[]>(propLogs);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const perPage = 20;

  useEffect(() => { setLocalLogs(propLogs); }, [propLogs]);

  useEffect(() => {
    const fetchLogs = async () => {
      const url = mockDb.getApiUrl();
      if (!url) return;
      try {
        const token = await mockDb.getToken();
        const res = await fetch(`${url}/api/audit-logs`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setLocalLogs(data.data || data);
        }
      } catch { /* ignore */ }
    };
    fetchLogs();
  }, []);

  const entityTypes = useMemo(() => {
    const types = new Set(localLogs.map((l) => l.entityType));
    return Array.from(types).sort();
  }, [localLogs]);

  const filtered = useMemo(() => {
    let result = localLogs;
    if (entityFilter !== 'all') {
      result = result.filter((l) => l.entityType === entityFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.entityType.toLowerCase().includes(q) ||
          l.entityId.toLowerCase().includes(q) ||
          (l as Record<string, unknown>)['email']?.toString().toLowerCase().includes(q) ||
          (l as Record<string, unknown>)['first_name']?.toString().toLowerCase().includes(q) ||
          (l as Record<string, unknown>)['last_name']?.toString().toLowerCase().includes(q)
      );
    }
    return result;
  }, [localLogs, entityFilter, searchQuery]);

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-[#D43D2A]" />
          <h1 className="text-2xl font-serif italic font-bold tracking-tight text-[#121212]">Audit Log</h1>
        </div>
        <span className="text-xs text-gray-500 font-mono">{filtered.length} entries</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white border border-[#E5E5E1]">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search actions, entities..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
            className="flex-1 text-sm border-none outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={entityFilter}
            onChange={(e) => { setEntityFilter(e.target.value); setPage(1); }}
            className="text-sm border border-[#E5E5E1] px-2 py-1 bg-white"
          >
            <option value="all">All entities</option>
            {entityTypes.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E5E5E1]">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E5E5E1] bg-[#FBFBF9]">
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85]">Time</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85]">User</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85]">Action</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85]">Entity</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85]">Entity ID</th>
              <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-[#8b8b85]">Changes</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">No audit log entries found</td>
              </tr>
            )}
            {paginated.map((log) => {
              const isExpanded = expandedId === log.id;
              const userFirst = (log as Record<string, unknown>)['first_name'] as string | undefined;
              const userLast = (log as Record<string, unknown>)['last_name'] as string | undefined;
              const userEmail = (log as Record<string, unknown>)['email'] as string | undefined;
              const userName = userFirst && userLast ? `${userFirst} ${userLast}` : log.userId;

              return (
                <React.Fragment key={log.id}>
                  <tr
                    className="border-b border-[#E5E5E1] hover:bg-[#FBFBF9] cursor-pointer transition-colors"
                    onClick={() => setExpandedId(isExpanded ? null : log.id)}
                  >
                    <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap font-mono">
                      {formatTimestamp(log.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-medium text-[#121212]">{userName}</div>
                      {userEmail && <div className="text-gray-400 text-[10px]">{userEmail}</div>}
                    </td>
                    <td className="px-4 py-3 text-xs text-[#121212]">
                      {ACTION_LABELS[log.action] || log.action}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ENTITY_COLORS[log.entityType] || 'bg-gray-100 text-gray-800'}`}>
                        {log.entityType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-500 max-w-[120px] truncate">
                      {log.entityId}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        {isExpanded ? <ChevronDown className="h-3 w-3 text-gray-400" /> : <ChevronRight className="h-3 w-3 text-gray-400" />}
                      </div>
                    </td>
                  </tr>
                  {isExpanded && (
                    <tr className="bg-[#F8F8F6]">
                      <td colSpan={6} className="px-4 py-3">
                        <ChangesDiff oldValue={log.oldValue} newValue={log.newValue} />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#E5E5E1] bg-[#FBFBF9]">
            <span className="text-xs text-gray-500">
              Showing {(page - 1) * perPage + 1}-{Math.min(page * perPage, filtered.length)} of {filtered.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 text-xs border border-[#E5E5E1] disabled:opacity-40 hover:bg-[#F1F1ED]"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 text-xs border border-[#E5E5E1] disabled:opacity-40 hover:bg-[#F1F1ED]"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

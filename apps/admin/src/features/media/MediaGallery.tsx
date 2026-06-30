import React, { useState, useMemo } from 'react';
import {
  Camera,
  Video,
  FileText,
  Image as ImageIcon,
  Upload,
  Filter,
  Search,
  X,
  Check,
  Trash2,
  Trophy,
  Users,
  Calendar,
} from 'lucide-react';
import { Media, Competition, Team } from '@ssmp/shared-types';
import { mockDb } from '../../shared/api/mockDb';

interface MatchRef {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
}

interface MediaGalleryProps {
  media: Media[];
  competitions: Competition[];
  teams: Team[];
  matches: MatchRef[];
  onActionCompleted: () => void;
}

const TYPE_ICONS: Record<string, typeof Camera> = {
  photo: Camera,
  video: Video,
  document: FileText,
  logo: ImageIcon,
};

const TYPE_COLORS: Record<string, string> = {
  photo: 'bg-blue-100 text-blue-800',
  video: 'bg-purple-100 text-purple-800',
  document: 'bg-amber-100 text-amber-800',
  logo: 'bg-emerald-100 text-emerald-800',
};

export default function MediaGallery({
  media,
  competitions,
  teams,
  matches,
  onActionCompleted,
}: MediaGalleryProps) {
  const [showUpload, setShowUpload] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterComp, setFilterComp] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // Upload form state
  const [uploadUrl, setUploadUrl] = useState('');
  const [uploadType, setUploadType] = useState<'photo' | 'video' | 'document' | 'logo'>('photo');
  const [uploadCaption, setUploadCaption] = useState('');
  const [uploadCompId, setUploadCompId] = useState('');
  const [uploadMatchId, setUploadMatchId] = useState('');
  const [uploadTeamId, setUploadTeamId] = useState('');

  const filtered = useMemo(() => {
    let result = media;
    if (filterType !== 'all') result = result.filter((m) => m.type === filterType);
    if (filterComp !== 'all') result = result.filter((m) => m.competitionId === filterComp);
    if (filterStatus === 'approved') result = result.filter((m) => m.isApproved);
    if (filterStatus === 'pending') result = result.filter((m) => !m.isApproved);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (m) => m.filename.toLowerCase().includes(q) || m.caption?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [media, filterType, filterComp, filterStatus, searchQuery]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl) return;

    const url = mockDb.getApiUrl();
    if (url) {
      const token = await mockDb.getToken();
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${url}/api/media`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          type: uploadType,
          url: uploadUrl,
          filename: uploadUrl.split('/').pop() || 'uploaded-file',
          fileSize: 0,
          mimeType: uploadType === 'photo' ? 'image/jpeg' : uploadType === 'video' ? 'video/mp4' : 'application/pdf',
          caption: uploadCaption || undefined,
          competitionId: uploadCompId || undefined,
          matchId: uploadMatchId || undefined,
          teamId: uploadTeamId || undefined,
        }),
      });
      if (!res.ok) {
        alert('Failed to upload media');
        return;
      }
    }

    setUploadUrl('');
    setUploadCaption('');
    setUploadCompId('');
    setUploadMatchId('');
    setUploadTeamId('');
    setShowUpload(false);
    onActionCompleted();
  };

  const handleApprove = async (id: string) => {
    const url = mockDb.getApiUrl();
    if (url) {
      const token = await mockDb.getToken();
      await fetch(`${url}/api/media/${id}/approve`, {
        method: 'PATCH',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});
    }
    onActionCompleted();
  };

  const handleReject = async (id: string) => {
    const url = mockDb.getApiUrl();
    if (url) {
      const token = await mockDb.getToken();
      await fetch(`${url}/api/media/${id}/reject`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }).catch(() => {});
    }
    onActionCompleted();
    if (selectedMedia?.id === id) setSelectedMedia(null);
  };

  const pendingCount = media.filter((m) => !m.isApproved).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic font-bold tracking-tight text-[#121212]">
            Media <span className="text-[#D43D2A]">Gallery</span>
          </h2>
          <p className="mt-1 text-xs text-[#8b8b85] font-mono uppercase tracking-wider">
            {media.length} items · {pendingCount} pending review
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-[#121212] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#D43D2A] transition cursor-pointer"
        >
          <Upload className="h-3.5 w-3.5" /> Upload Media
        </button>
      </div>

      {/* Upload Form */}
      {showUpload && (
        <form onSubmit={handleUpload} className="border border-[#121212] bg-white p-6 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#121212]">Upload New Media</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8b8b85] font-bold mb-1">Media URL *</label>
              <input
                type="url"
                value={uploadUrl}
                onChange={(e) => setUploadUrl(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full border border-[#E5E5E1] px-3 py-2 text-xs focus:border-[#121212] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8b8b85] font-bold mb-1">Type *</label>
              <select
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value as any)}
                className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs"
              >
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="logo">Logo</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-[9px] uppercase tracking-wider text-[#8b8b85] font-bold mb-1">Caption</label>
              <input
                type="text"
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="Describe this media..."
                className="w-full border border-[#E5E5E1] px-3 py-2 text-xs focus:border-[#121212] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8b8b85] font-bold mb-1">Competition</label>
              <select
                value={uploadCompId}
                onChange={(e) => setUploadCompId(e.target.value)}
                className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs"
              >
                <option value="">-- None --</option>
                {competitions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8b8b85] font-bold mb-1">Match</label>
              <select
                value={uploadMatchId}
                onChange={(e) => setUploadMatchId(e.target.value)}
                className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs"
              >
                <option value="">-- None --</option>
                {matches.map((m) => {
                  const home = teams.find((t) => t.id === m.homeTeamId);
                  const away = teams.find((t) => t.id === m.awayTeamId);
                  return (
                    <option key={m.id} value={m.id}>
                      {home?.name || 'TBD'} vs {away?.name || 'TBD'}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-[9px] uppercase tracking-wider text-[#8b8b85] font-bold mb-1">Team</label>
              <select
                value={uploadTeamId}
                onChange={(e) => setUploadTeamId(e.target.value)}
                className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs"
              >
                <option value="">-- None --</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="submit" className="px-4 py-2 bg-[#121212] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#D43D2A]">
              Submit for Review
            </button>
            <button type="button" onClick={() => setShowUpload(false)} className="px-4 py-2 border border-[#E5E5E1] text-[#8b8b85] text-[10px] uppercase font-bold tracking-widest hover:text-[#121212]">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-[#E5E5E1]">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="text-xs border-none outline-none bg-transparent w-40"
          />
        </div>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-xs border border-[#E5E5E1] px-2 py-1 bg-white">
          <option value="all">All Types</option>
          <option value="photo">Photos</option>
          <option value="video">Videos</option>
          <option value="document">Documents</option>
          <option value="logo">Logos</option>
        </select>
        <select value={filterComp} onChange={(e) => setFilterComp(e.target.value)} className="text-xs border border-[#E5E5E1] px-2 py-1 bg-white">
          <option value="all">All Competitions</option>
          {competitions.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="text-xs border border-[#E5E5E1] px-2 py-1 bg-white">
          <option value="all">All Status</option>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
        </select>
        <span className="text-[10px] text-[#8b8b85] font-mono ml-auto">{filtered.length} results</span>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full border border-dashed border-[#E5E5E1] p-12 text-center bg-white">
            <Camera className="h-10 w-10 text-slate-300 mx-auto stroke-1" />
            <p className="mt-4 text-sm font-serif italic text-slate-500">No media found</p>
          </div>
        ) : (
          filtered.map((m) => {
            const Icon = TYPE_ICONS[m.type] || Camera;
            return (
              <div
                key={m.id}
                className="border border-[#E5E5E1] bg-white overflow-hidden group hover:border-[#121212] transition-all cursor-pointer"
                onClick={() => setSelectedMedia(m)}
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                  {m.type === 'photo' || m.type === 'logo' ? (
                    <img
                      src={m.url}
                      alt={m.caption || m.filename}
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                  ) : m.type === 'video' ? (
                    <div className="h-full w-full flex items-center justify-center bg-slate-100">
                      <Video className="h-8 w-8 text-slate-400" />
                    </div>
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-slate-100">
                      <FileText className="h-8 w-8 text-slate-400" />
                    </div>
                  )}
                  {!m.isApproved && (
                    <div className="absolute top-2 left-2 bg-[#D43D2A] text-white text-[8px] uppercase font-bold font-mono px-1.5 py-0.5">
                      PENDING
                    </div>
                  )}
                  <div className={`absolute top-2 right-2 text-[8px] uppercase font-bold font-mono px-1.5 py-0.5 ${TYPE_COLORS[m.type]}`}>
                    {m.type}
                  </div>
                </div>
                <div className="p-2.5 border-t border-[#E5E5E1]">
                  <p className="text-[10px] text-[#121212] font-semibold truncate">{m.filename}</p>
                  {m.caption && (
                    <p className="text-[9px] text-[#8b8b85] truncate mt-0.5">{m.caption}</p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Detail Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setSelectedMedia(null)}>
          <div className="bg-white border border-[#121212] max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-[#E5E5E1]">
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#121212]">Media Detail</h3>
              <button onClick={() => setSelectedMedia(null)} className="p-1 hover:bg-[#F1F1ED] cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              {(selectedMedia.type === 'photo' || selectedMedia.type === 'logo') && (
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.caption || selectedMedia.filename}
                  className="w-full aspect-video object-cover border border-[#E5E5E1]"
                  referrerPolicy="no-referrer"
                />
              )}
              {selectedMedia.type === 'video' && (
                <video src={selectedMedia.url} controls className="w-full aspect-video border border-[#E5E5E1]" />
              )}
              {selectedMedia.type === 'document' && (
                <div className="aspect-video flex items-center justify-center bg-slate-50 border border-[#E5E5E1]">
                  <FileText className="h-16 w-16 text-slate-300" />
                </div>
              )}
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${TYPE_COLORS[selectedMedia.type]}`}>
                    {selectedMedia.type}
                  </span>
                  <span className={`inline-block px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${selectedMedia.isApproved ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-[#D43D2A]'}`}>
                    {selectedMedia.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <p className="text-xs text-[#121212] font-semibold">{selectedMedia.filename}</p>
                {selectedMedia.caption && <p className="text-xs text-[#8b8b85] italic">{selectedMedia.caption}</p>}
                <div className="text-[10px] text-[#8b8b85] font-mono space-y-0.5">
                  {selectedMedia.competitionId && <p>Competition: {competitions.find((c) => c.id === selectedMedia.competitionId)?.name || selectedMedia.competitionId}</p>}
                  {selectedMedia.matchId && <p>Match: {selectedMedia.matchId}</p>}
                  {selectedMedia.teamId && <p>Team: {teams.find((t) => t.id === selectedMedia.teamId)?.name || selectedMedia.teamId}</p>}
                  <p>Uploaded: {new Date(selectedMedia.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              {!selectedMedia.isApproved && (
                <div className="mt-4 pt-4 border-t border-[#E5E5E1] flex gap-2">
                  <button
                    onClick={() => { handleApprove(selectedMedia.id); setSelectedMedia(null); }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-[#121212] text-white text-[10px] uppercase font-bold tracking-widest hover:bg-[#D43D2A] cursor-pointer"
                  >
                    <Check className="h-3 w-3" /> Approve
                  </button>
                  <button
                    onClick={() => { handleReject(selectedMedia.id); }}
                    className="flex items-center gap-1 px-3 py-1.5 border border-[#E5E5E1] text-[#D43D2A] text-[10px] uppercase font-bold tracking-widest hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-3 w-3" /> Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

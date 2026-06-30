/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Megaphone,
  User,
  Clock,
  Eye,
  Camera,
} from 'lucide-react';
import { NewsArticle, Media, Team, Competition } from '@ssmp/shared-types';
import { mockDb } from '../../shared/api/mockDb';
import MediaGallery from './MediaGallery';

interface MatchRef {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
}

interface NewsMediaProps {
  news: NewsArticle[];
  media: Media[];
  teams: Team[];
  competitions: Competition[];
  matches: MatchRef[];
  onActionCompleted: () => void;
}

async function apiFetch(path: string, options?: RequestInit) {
  const url = mockDb.getApiUrl();
  if (!url) return null;
  const token = await mockDb.getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...((options?.headers as Record<string, string>) || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${url}${path}`, { ...options, headers });
  if (!res.ok) return null;
  if (res.status === 204) return true;
  const data = await res.json();
  return data.data ?? data;
}

export default function NewsMedia({ news: propNews, media, teams, competitions, matches, onActionCompleted }: NewsMediaProps) {
  const [activeSubTab, setActiveSubTab] = useState<'news' | 'media'>('news');
  const [localNews, setLocalNews] = useState<NewsArticle[]>(propNews);

  React.useEffect(() => { setLocalNews(propNews); }, [propNews]);

  // News State
  const [showNewsForm, setShowNewsForm] = useState(false);
  const [newsTitle, setNewsTitle] = useState('');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsContent, setNewsContent] = useState('');
  const [newsPublish, setNewsPublish] = useState(true);

  const getTeamName = (tid?: string) => {
    if (!tid) return '';
    const t = teams.find((tm) => tm.id === tid);
    return t ? t.name : 'Unknown Team';
  };

  // News Handlers
  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsContent) return;

    const result = await apiFetch('/api/news', {
      method: 'POST',
      body: JSON.stringify({
        title: newsTitle,
        excerpt: newsExcerpt || undefined,
        content: newsContent,
        isPublished: newsPublish,
        publishedAt: newsPublish ? new Date().toISOString() : undefined,
      }),
    });

    if (result) {
      setLocalNews((prev) => [result, ...prev]);
    }

    setNewsTitle('');
    setNewsExcerpt('');
    setNewsContent('');
    setShowNewsForm(false);
    onActionCompleted();
  };

  const handleDeleteNews = async (id: string) => {
    await apiFetch(`/api/news/${id}`, { method: 'DELETE' });
    setLocalNews((prev) => prev.filter((n) => n.id !== id));
    onActionCompleted();
  };

  const handleTogglePublish = async (article: NewsArticle) => {
    const result = await apiFetch(`/api/news/${article.id}`, {
      method: 'PATCH',
      body: JSON.stringify({
        isPublished: !article.isPublished,
        publishedAt: !article.isPublished ? new Date().toISOString() : null,
      }),
    });
    if (result) {
      setLocalNews((prev) => prev.map((n) => n.id === article.id ? result : n));
    }
    onActionCompleted();
  };

  // Media Handlers
  const handleReviewMedia = (id: string, isApproved: boolean) => {
    // Handled by MediaGallery directly via API
    onActionCompleted();
  };

  const pendingMedia = media.filter((m) => !m.isApproved);
  const approvedMedia = media.filter((m) => m.isApproved);

  return (
    <div className="space-y-6 font-sans text-xs">
      {/* Editorial Header */}
      <div className="border-b border-[#121212] pb-4">
        <h1 className="text-3xl font-serif italic font-bold tracking-tight text-[#121212]">
          News, Press & <span className="text-[#D43D2A]">Media Moderation</span>
        </h1>
        <p className="mt-2 text-xs uppercase tracking-widest text-slate-500 font-bold leading-normal">
          Log news articles and moderate press photographs uploaded from stadium grounds.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E5E5E1]">
        <button
          onClick={() => setActiveSubTab('news')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
            activeSubTab === 'news'
              ? 'border-[#D43D2A] text-[#D43D2A]'
              : 'border-transparent text-slate-400 hover:text-[#121212]'
          }`}
        >
          <span className="flex items-center gap-2">
            <FileText className="h-4 w-4" /> District Press Board
            <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#121212] text-white font-bold rounded-none">
              {localNews.length} ARTICLES
            </span>
          </span>
        </button>
        <button
          onClick={() => setActiveSubTab('media')}
          className={`px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all cursor-pointer border-b-2 ${
            activeSubTab === 'media'
              ? 'border-[#D43D2A] text-[#D43D2A]'
              : 'border-transparent text-slate-400 hover:text-[#121212]'
          }`}
        >
          <span className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4" /> Media Moderation Queue
            {pendingMedia.length > 0 && (
              <span className="px-1.5 py-0.5 text-[9px] font-mono bg-[#D43D2A] text-white font-bold rounded-none animate-pulse">
                {pendingMedia.length} NEW
              </span>
            )}
          </span>
        </button>
      </div>

      {activeSubTab === 'news' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* News Queue */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                Championship Announcements
              </h2>
              <button
                onClick={() => setShowNewsForm(!showNewsForm)}
                className="editorial-btn-primary cursor-pointer py-1.5 px-3.5 flex items-center gap-1.5 text-[10px]"
              >
                <Plus className="h-3.5 w-3.5" /> Draft News Announcement
              </button>
            </div>

            {showNewsForm && (
              <form
                onSubmit={handleSaveNews}
                className="border border-[#121212] bg-[#FBFBF9] p-6 rounded-none space-y-4"
              >
                <h3 className="text-xs uppercase tracking-wider text-slate-500 font-bold border-b border-[#E5E5E1] pb-2">
                  Draft New Press Article
                </h3>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono font-bold">
                    Article Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Westside Tigers Claims Matchday 1 Victory"
                    value={newsTitle}
                    onChange={(e) => setNewsTitle(e.target.value)}
                    className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs focus:ring-0 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono font-bold">
                    Excerpt / Short Summary
                  </label>
                  <input
                    type="text"
                    placeholder="Provide a 1-sentence highlight summary of the article..."
                    value={newsExcerpt}
                    onChange={(e) => setNewsExcerpt(e.target.value)}
                    className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs focus:ring-0 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1 font-mono font-bold">
                    Full Content (Markdown supported)
                  </label>
                  <textarea
                    placeholder="Write the full press details here..."
                    rows={8}
                    value={newsContent}
                    onChange={(e) => setNewsContent(e.target.value)}
                    className="w-full border border-[#E5E5E1] bg-white px-3 py-2 text-xs focus:ring-0 focus:outline-none resize-none font-serif"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newsPublish"
                    checked={newsPublish}
                    onChange={(e) => setNewsPublish(e.target.checked)}
                    className="rounded-none border-[#E5E5E1] text-[#D43D2A] focus:ring-0"
                  />
                  <label htmlFor="newsPublish" className="text-xs font-semibold text-[#121212]">
                    Publish immediately onto the live announcements boards
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewsForm(false)}
                    className="px-3 py-2 text-slate-500 hover:text-black cursor-pointer font-bold text-[10px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#121212] hover:bg-[#D43D2A] text-white uppercase font-bold tracking-wider text-[10px]"
                  >
                    Save Press Draft
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-6">
              {localNews.map((article) => (
                <div
                  key={article.id}
                  className="border border-[#E5E5E1] bg-white p-6 rounded-none relative hover:border-[#121212] transition-all"
                >
                  <div className="absolute top-6 right-6 flex gap-3">
                    <button
                      onClick={() => handleTogglePublish(article)}
                      className={`text-xs uppercase font-bold tracking-wider hover:underline cursor-pointer ${
                        article.isPublished ? 'text-slate-400' : 'text-emerald-600'
                      }`}
                    >
                      {article.isPublished ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDeleteNews(article.id)}
                      className="text-slate-400 hover:text-[#D43D2A] transition"
                      title="Delete Article"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <span
                    className={`inline-block text-[9px] font-mono font-bold uppercase px-2 py-0.5 border ${
                      article.isPublished
                        ? 'bg-emerald-55 bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    {article.isPublished ? 'Live Announcement' : 'Draft Copy'}
                  </span>

                  <h3 className="mt-3 text-lg font-serif font-bold text-[#121212] leading-tight">
                    {article.title}
                  </h3>

                  {article.excerpt && (
                    <p className="mt-2 text-xs text-[#8b8b85] font-serif italic">
                      "{article.excerpt}"
                    </p>
                  )}

                  <p className="mt-4 text-xs text-slate-600 leading-relaxed font-sans whitespace-pre-line">
                    {article.content}
                  </p>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4 text-[10px] text-slate-400 font-semibold font-mono">
                    <span className="flex items-center gap-1">
                      <Megaphone className="h-3.5 w-3.5 text-[#D43D2A]" />
                      Logged by Editor
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {new Date(article.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Side Info */}
          <div className="space-y-6">
            <div className="border border-[#121212] bg-[#FBFBF9] p-6 rounded-none">
              <h3 className="text-xs uppercase tracking-wider text-[#121212] font-bold border-b border-[#121212] pb-3 flex items-center gap-2">
                <Megaphone className="h-4.5 w-4.5 text-[#D43D2A]" /> District Media Standards
              </h3>
              <p className="mt-4 text-xs text-slate-600 leading-relaxed">
                Publishing press stories maintains the high academic profile of inter-school championships. All stories are automatically syndicating into team mobile notifications.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'media' && (
        <MediaGallery
          media={media}
          competitions={competitions}
          teams={teams}
          matches={matches}
          onActionCompleted={onActionCompleted}
        />
      )}
    </div>
  );
}

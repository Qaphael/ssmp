import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Organization, Season, Competition, Team, Player, TeamRegistration, RosterSubmission, Fixture, Pitch, UserRole, Official, TransferRequest, MatchEvent, NewsArticle, Media, Suspension, AuditLog, Notification } from '@ssmp/shared-types';
import { mockDb, detectConflicts } from './shared/api/mockDb';
import Sidebar from './app/layout/Sidebar';
import Header from './app/layout/Header';
import Dashboard from './features/dashboard/Dashboard';
import CompetitionWizard from './features/competitions/CompetitionWizard';
import RegistrationQueue from './features/registrations/RegistrationQueue';
import RosterQueue from './features/rosters/RosterQueue';
import FixtureList from './features/fixtures/FixtureList';
import TransfersDiscipline from './features/transfers/TransfersDiscipline';
import OfficialsMatchEvents from './features/officials/OfficialsMatchEvents';
import NewsMedia from './features/media/NewsMedia';
import AuditLogViewer from './features/audit/AuditLogViewer';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('comp_admin');
  const [apiUrl, setApiUrl] = useState(import.meta.env.VITE_API_URL || '');
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [pitches, setPitches] = useState<Pitch[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [rosters, setRosters] = useState<RosterSubmission[]>([]);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [transfers, setTransfers] = useState<TransferRequest[]>([]);
  const [suspensions, setSuspensions] = useState<Suspension[]>([]);
  const [officials, setOfficials] = useState<Official[]>([]);
  const [matchEvents, setMatchEvents] = useState<MatchEvent[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [media, setMedia] = useState<Media[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const isDemoMode = !apiUrl;

  useEffect(() => {
    refreshAllData();
  }, []);

  const refreshAllData = async () => {
    const url = apiUrl || import.meta.env.VITE_API_URL || '';
    if (url) {
      try {
        const compsRes = await fetch(`${url}/api/public/competitions`);
        if (compsRes.ok) setCompetitions(await compsRes.json());
      } catch { /* fall through to demo */ }
      try {
        const seasonsRes = await fetch(`${url}/api/public/seasons`);
        if (seasonsRes.ok) setSeasons(await seasonsRes.json());
      } catch { /* ignore */ }
      try {
        const teamsRes = await fetch(`${url}/api/public/teams`);
        if (teamsRes.ok) setTeams(await teamsRes.json());
      } catch { /* ignore */ }
      try {
        const playersRes = await fetch(`${url}/api/public/players`);
        if (playersRes.ok) setPlayers(await playersRes.json());
      } catch { /* ignore */ }
      try {
        const token = await mockDb.getToken();
        const fixturesRes = await fetch(`${url}/api/fixtures`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (fixturesRes.ok) {
          const data = await fixturesRes.json();
          setFixtures(data.data || data);
        }
      } catch { /* ignore */ }
      try {
        const token = await mockDb.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const transfersRes = await fetch(`${url}/api/transfers`, { headers });
        if (transfersRes.ok) {
          const data = await transfersRes.json();
          setTransfers(data.data || data);
        }
      } catch { /* ignore */ }
      try {
        const token = await mockDb.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const suspRes = await fetch(`${url}/api/discipline/suspensions`, { headers });
        if (suspRes.ok) {
          const data = await suspRes.json();
          setSuspensions(data.data || data);
        }
      } catch { /* ignore */ }
      try {
        const token = await mockDb.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const notifRes = await fetch(`${url}/api/notifications`, { headers });
        if (notifRes.ok) {
          const data = await notifRes.json();
          setNotifications(data.data || data);
        }
      } catch { /* ignore */ }
      try {
        const token = await mockDb.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const newsRes = await fetch(`${url}/api/news`, { headers });
        if (newsRes.ok) {
          const data = await newsRes.json();
          setNews(data.data || data);
        }
      } catch { /* ignore */ }
      try {
        const token = await mockDb.getToken();
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const mediaRes = await fetch(`${url}/api/media`, { headers });
        if (mediaRes.ok) {
          const data = await mediaRes.json();
          setMedia(data.data || data);
        }
      } catch { /* ignore */ }
    }

    // Demo mode fallback: populate from local storage when no API is configured
    if (!url) {
      setSeasons(mockDb.getSeasons());
      setCompetitions(mockDb.getCompetitions());
      setTeams(mockDb.getTeams());
      setPlayers(mockDb.getPlayers());
      setFixtures(mockDb.getFixtures());
      setTransfers(mockDb.getTransfers());
      setSuspensions(mockDb.getSuspensions());
      setOfficials(mockDb.getOfficials());
      setMatchEvents(mockDb.getEvents());
      setNotifications(mockDb.getNotifications());
      setNews(mockDb.getNews());
      setMedia(mockDb.getMedia());
    }

    setPitches(mockDb.getPitches());
    setRegistrations(mockDb.getRegistrations());
    setRosters(mockDb.getRosters());
    setAuditLogs(mockDb.getAuditLogs());
  };

  const handleSaveApiUrl = (url: string) => {
    setApiUrl(url);
  };

  const handleCompetitionCreated = async () => {
    await refreshAllData();
  };

  const pendingRegCount = registrations.filter((r) => r.status === 'pending').length;
  const pendingRosterCount = rosters.filter((r) => r.status === 'submitted').length;
  const conflicts = detectConflicts(fixtures, competitions);
  const fixtureClashCount = conflicts.length;
  const pendingTransferCount = transfers.filter((t) => t.status === 'pending').length;
  const pendingMediaCount = media.filter((m) => !m.isApproved).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FBFBF9] font-sans text-[#121212]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingRegCount={pendingRegCount}
        pendingRosterCount={pendingRosterCount}
        fixtureClashCount={fixtureClashCount}
        pendingTransferCount={pendingTransferCount}
        pendingMediaCount={pendingMediaCount}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          currentRole={currentRole}
          onChangeRole={setCurrentRole}
          apiUrl={apiUrl}
          onSaveApiUrl={handleSaveApiUrl}
        />

        {/* Demo Mode Banner */}
        {isDemoMode && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                Demo Mode — Using local mock data
              </span>
            </div>
            <span className="text-[10px] text-amber-600 font-sans">
              Configure an API URL in the header to connect to the live server
            </span>
          </div>
        )}

        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8">
          <div className="mx-auto max-w-7xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {activeTab === 'dashboard' && (
                  <Dashboard
                    currentRole={currentRole}
                    competitions={competitions}
                    teams={teams}
                    players={players}
                    registrations={registrations}
                    rosters={rosters}
                    fixtures={fixtures}
                    officials={officials}
                    suspensions={suspensions}
                    matchEvents={matchEvents}
                    notifications={notifications}
                    clashCount={fixtureClashCount}
                    onNavigate={setActiveTab}
                  />
                )}

                {activeTab === 'wizard' && (
                  <CompetitionWizard
                    seasons={seasons}
                    onCompetitionCreated={handleCompetitionCreated}
                  />
                )}

                {activeTab === 'registrations' && (
                  <RegistrationQueue
                    registrations={registrations}
                    competitions={competitions}
                    onReviewCompleted={refreshAllData}
                  />
                )}

                {activeTab === 'rosters' && (
                  <RosterQueue
                    rosters={rosters}
                    teams={teams}
                    players={players}
                    competitions={competitions}
                    onReviewCompleted={refreshAllData}
                  />
                )}

                {activeTab === 'fixtures' && (
                  <FixtureList
                    fixtures={fixtures}
                    teams={teams}
                    pitches={pitches}
                    competitions={competitions}
                    onFixtureChanged={refreshAllData}
                  />
                )}

                {activeTab === 'transfers' && (
                  <TransfersDiscipline
                    transfers={transfers}
                    suspensions={suspensions}
                    players={players}
                    teams={teams}
                    competitions={competitions}
                    onActionCompleted={refreshAllData}
                  />
                )}

                {activeTab === 'officials' && (
                  <OfficialsMatchEvents
                    officials={officials}
                    fixtures={fixtures}
                    teams={teams}
                    players={players}
                    competitions={competitions}
                    matchEvents={matchEvents}
                    onActionCompleted={refreshAllData}
                    currentRole={currentRole}
                  />
                )}

                {activeTab === 'news' && (
                  <NewsMedia
                    news={news}
                    media={media}
                    teams={teams}
                    competitions={competitions}
                    matches={fixtures.map((f) => ({ id: f.id, homeTeamId: f.homeTeamId, awayTeamId: f.awayTeamId }))}
                    onActionCompleted={refreshAllData}
                  />
                )}

                {activeTab === 'audit' && (
                  <AuditLogViewer auditLogs={auditLogs} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

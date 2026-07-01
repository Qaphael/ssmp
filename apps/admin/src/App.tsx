import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Season, Competition, Team, Player, TeamRegistration, RosterSubmission, Fixture, Pitch, UserRole, Official, TransferRequest, MatchEvent, NewsArticle, Media, Suspension, AuditLog, Notification } from '@ssmp/shared-types';
import { mockDb, detectConflicts } from './shared/api/mockDb';
import { getToken, getUser, logout as authLogout, getAuthHeaders, AuthUser } from './shared/api/auth';
import Sidebar from './app/layout/Sidebar';
import Header from './app/layout/Header';
import LoginScreen from './features/auth/LoginScreen';
import RegisterScreen from './features/auth/RegisterScreen';
import ForgotPasswordScreen from './features/auth/ForgotPasswordScreen';
import ResetPasswordScreen from './features/auth/ResetPasswordScreen';
import ProfileScreen from './features/auth/ProfileScreen';
import UserManagement from './features/auth/UserManagement';
import Dashboard from './features/dashboard/Dashboard';
import CompetitionWizard from './features/competitions/CompetitionWizard';
import RegistrationQueue from './features/registrations/RegistrationQueue';
import RosterQueue from './features/rosters/RosterQueue';
import FixtureList from './features/fixtures/FixtureList';
import TransfersDiscipline from './features/transfers/TransfersDiscipline';
import OfficialsMatchEvents from './features/officials/OfficialsMatchEvents';
import NewsMedia from './features/media/NewsMedia';
import AuditLogViewer from './features/audit/AuditLogViewer';

type AuthView = 'login' | 'register' | 'forgot-password' | 'reset-password';

export default function App() {
  // Auth state
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    const token = getToken();
    return token ? getUser() : null;
  });
  const [authView, setAuthView] = useState<AuthView>('login');

  // App state
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
  const isAuthenticated = isDemoMode || !!getToken();

  // Sync currentRole with auth user role
  useEffect(() => {
    if (authUser?.role) {
      setCurrentRole(authUser.role as UserRole);
    }
  }, [authUser]);

  const handleAuth = (data: { token: string; user: AuthUser }) => {
    setAuthUser(data.user);
    setAuthView('login');
  };

  const handleLogout = () => {
    authLogout();
    setAuthUser(null);
    setAuthView('login');
    setActiveTab('dashboard');
  };

  const handleUserUpdated = (updatedUser: AuthUser) => {
    setAuthUser(updatedUser);
  };

  const refreshAllData = useCallback(async () => {
    const url = apiUrl || import.meta.env.VITE_API_URL || '';
    if (url) {
      const headers = getAuthHeaders();

      // Public endpoints (no auth needed)
      try {
        const compsRes = await fetch(`${url}/api/public/competitions`);
        if (compsRes.ok) {
          const data = await compsRes.json();
          setCompetitions(data.data || data);
        }
      } catch { /* fall through to demo */ }
      try {
        const seasonsRes = await fetch(`${url}/api/public/seasons`);
        if (seasonsRes.ok) {
          const data = await seasonsRes.json();
          setSeasons(data.data || data);
        }
      } catch { /* ignore */ }
      try {
        const teamsRes = await fetch(`${url}/api/public/teams`);
        if (teamsRes.ok) {
          const data = await teamsRes.json();
          setTeams(data.data || data);
        }
      } catch { /* ignore */ }
      try {
        const playersRes = await fetch(`${url}/api/public/players`);
        if (playersRes.ok) {
          const data = await playersRes.json();
          setPlayers(data.data || data);
        }
      } catch { /* ignore */ }

      // Authenticated endpoints
      const authFetch = async (path: string) => {
        const res = await fetch(`${url}${path}`, { headers });
        if (res.status === 401) {
          authLogout();
          setAuthUser(null);
          return null;
        }
        if (!res.ok) return null;
        return res.json();
      };

      try {
        const data = await authFetch('/api/fixtures');
        if (data) setFixtures(data.data || data);
      } catch { /* ignore */ }
      try {
        const data = await authFetch('/api/transfers');
        if (data) setTransfers(data.data || data);
      } catch { /* ignore */ }
      try {
        const data = await authFetch('/api/discipline/suspensions');
        if (data) setSuspensions(data.data || data);
      } catch { /* ignore */ }
      try {
        const data = await authFetch('/api/notifications');
        if (data) setNotifications(data.data || data);
      } catch { /* ignore */ }
      try {
        const data = await authFetch('/api/news');
        if (data) setNews(data.data || data);
      } catch { /* ignore */ }
      try {
        const data = await authFetch('/api/media');
        if (data) setMedia(data.data || data);
      } catch { /* ignore */ }
    }

    // Demo mode fallback
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
  }, [apiUrl]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
    }
  }, [isAuthenticated, refreshAllData]);

  const handleSaveApiUrl = (url: string) => {
    setApiUrl(url);
  };

  const handleCompetitionCreated = async () => {
    await refreshAllData();
  };

  // Auth screens
  if (!isAuthenticated) {
    if (authView === 'register') {
      return <RegisterScreen onAuth={handleAuth} onSwitchToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'forgot-password') {
      return <ForgotPasswordScreen onSwitchToLogin={() => setAuthView('login')} />;
    }
    if (authView === 'reset-password') {
      return <ResetPasswordScreen onSwitchToLogin={() => setAuthView('login')} />;
    }
    return (
      <LoginScreen
        onAuth={handleAuth}
        onSwitchToRegister={() => setAuthView('register')}
        onSwitchToForgot={() => setAuthView('forgot-password')}
      />
    );
  }

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
        userRole={authUser?.role}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          currentRole={currentRole}
          onChangeRole={setCurrentRole}
          apiUrl={apiUrl}
          onSaveApiUrl={handleSaveApiUrl}
          user={authUser}
          onLogout={handleLogout}
          isDemoMode={isDemoMode}
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

                {activeTab === 'profile' && authUser && (
                  <ProfileScreen currentUser={authUser} onUserUpdated={handleUserUpdated} />
                )}

                {activeTab === 'users' && authUser?.role === 'system_admin' && (
                  <UserManagement />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

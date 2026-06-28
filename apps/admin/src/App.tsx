import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Organization, Season, Competition, Team, Player, TeamRegistration, RosterSubmission, Fixture, Pitch, UserRole, Official, TransferRequest, MatchEvent, NewsArticle, Media, Suspension } from '@ssmp/shared-types';
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

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentRole, setCurrentRole] = useState<UserRole>('comp_admin');
  const [apiUrl, setApiUrl] = useState('');
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
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [media, setMedia] = useState<Media[]>([]);

  useEffect(() => {
    refreshAllData();
    setApiUrl(mockDb.getApiUrl());
  }, []);

  const refreshAllData = () => {
    setSeasons(mockDb.getSeasons());
    setCompetitions(mockDb.getCompetitions());
    setPitches(mockDb.getPitches());
    setTeams(mockDb.getTeams());
    setPlayers(mockDb.getPlayers());
    setRegistrations(mockDb.getRegistrations());
    setRosters(mockDb.getRosters());
    setFixtures(mockDb.getFixtures());
    setTransfers(mockDb.getTransfers());
    setSuspensions(mockDb.getSuspensions());
    setOfficials(mockDb.getOfficials());
    setMatchEvents(mockDb.getEvents());
    setNews(mockDb.getNews());
    setMedia(mockDb.getMedia());
  };

  const handleSaveApiUrl = (url: string) => {
    mockDb.setApiUrl(url);
    setApiUrl(url);
  };

  const handleCompetitionCreated = () => {
    refreshAllData();
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
                    competitions={competitions}
                    teams={teams}
                    players={players}
                    registrations={registrations}
                    rosters={rosters}
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
                  />
                )}

                {activeTab === 'news' && (
                  <NewsMedia
                    news={news}
                    media={media}
                    teams={teams}
                    onActionCompleted={refreshAllData}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}

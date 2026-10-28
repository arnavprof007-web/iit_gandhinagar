import React, { useState } from 'react';
import { communityService } from '../services/communityService';
import { useToast } from '../context/ToastContext';
import { TeamCard } from '../components/community/TeamCard';
import { LeaderboardTable } from '../components/community/LeaderboardTable';
import { CommunityEventCard } from '../components/community/CommunityEventCard';
import { CreateTeamModal } from '../components/community/CreateTeamModal';
import { Card, CardHeader, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Tabs } from '../components/common/Tabs';
import { Alert } from '../components/common/Alert';
import { StatCard } from '../components/common/StatCard';
import {
  Users,
  Trophy,
  Plus,
  Calendar,
  Sparkles,
  Award,
  Globe2,
  Share2,
} from 'lucide-react';

export const CommunityPage: React.FC = () => {
  const { showToast } = useToast();

  const [teams, setTeams] = useState(() => communityService.getTeams());
  const [leaderboard, setLeaderboard] = useState(() => communityService.getLeaderboard());
  const [events, setEvents] = useState(() => communityService.getEvents());
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('squads');

  const handleToggleJoin = (teamId: string) => {
    const updated = communityService.toggleJoinTeam(teamId);
    setTeams(communityService.getTeams());
    if (updated) {
      showToast({
        title: updated.isMember ? 'Squad Joined!' : 'Left Squad',
        message: updated.isMember
          ? `You are now collaborating with "${updated.name}".`
          : `Removed from "${updated.name}".`,
        type: updated.isMember ? 'success' : 'info',
      });
    }
  };

  const handleCreateTeam = (data: any) => {
    const created = communityService.createTeam(data);
    setTeams(communityService.getTeams());
    showToast({
      title: 'Squad Created!',
      message: `Your squad "${created.name}" is now active in ${created.city}.`,
      type: 'success',
    });
  };

  const handleToggleEvent = (eventId: string) => {
    const updated = communityService.toggleEventRegistration(eventId);
    setEvents(communityService.getEvents());
    if (updated) {
      showToast({
        title: updated.isRegistered ? 'RSVP Confirmed' : 'RSVP Cancelled',
        message: updated.isRegistered
          ? `You're registered for "${updated.title}".`
          : `Cancelled RSVP for "${updated.title}".`,
        type: updated.isRegistered ? 'success' : 'info',
      });
    }
  };

  const handleShareAchievement = () => {
    showToast({
      title: 'Card Copied',
      message: 'Shareable Mission LiFE achievement card link copied to clipboard!',
      type: 'success',
    });
  };

  return (
    <div className="space-y-6">
      <Alert type="info">
        <strong>Community Impact Simulation:</strong> Squad leaderboards, event participants, and city metrics represent illustrative sample data for demo presentation. No private citizen addresses or sensitive data are collected or shared.
      </Alert>

      {/* Hero Stats Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Community Squads"
          value={teams.length}
          subtitle="Gandhinagar & Gujarat"
          icon={<Users className="w-5 h-5 text-emerald-600" />}
        />
        <StatCard
          title="Collective CO₂ Saved"
          value="10,090 kg"
          subtitle="Aggregate squad actions"
          icon={<Globe2 className="w-5 h-5 text-teal-600" />}
        />
        <StatCard
          title="Active Participants"
          value="194 Citizens"
          subtitle="Across 4 local chapters"
          icon={<Sparkles className="w-5 h-5 text-amber-500" />}
        />
        <StatCard
          title="Upcoming Eco Events"
          value={events.length}
          subtitle="Workshops & cleanups"
          icon={<Calendar className="w-5 h-5 text-purple-600" />}
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Tabs
          tabs={[
            { id: 'squads', label: 'Sustainability Squads', badge: teams.length },
            { id: 'leaderboard', label: 'Citizen Leaderboard', badge: leaderboard.length },
            { id: 'events', label: 'Local Workshops & Drives', badge: events.length },
          ]}
          activeTab={activeTab}
          onChange={setActiveTab}
        />

        {activeTab === 'squads' && (
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create New Squad
          </Button>
        )}

        {activeTab === 'leaderboard' && (
          <Button
            size="sm"
            variant="secondary"
            onClick={handleShareAchievement}
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Share My Ranking
          </Button>
        )}
      </div>

      {/* TAB 1: SQUADS */}
      {activeTab === 'squads' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {teams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onToggleJoin={handleToggleJoin}
            />
          ))}
        </div>
      )}

      {/* TAB 2: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <Card className="overflow-hidden">
          <CardHeader
            title="Gandhinagar Citizen Sustainability Rankings"
            subtitle="Top contributors across energy reduction and completed Mission LiFE challenges"
            icon={<Trophy className="w-5 h-5 text-amber-500" />}
          />
          <LeaderboardTable items={leaderboard} />
        </Card>
      )}

      {/* TAB 3: COMMUNITY EVENTS */}
      {activeTab === 'events' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {events.map((ev) => (
            <CommunityEventCard
              key={ev.id}
              event={ev}
              onToggleRegister={handleToggleEvent}
            />
          ))}
        </div>
      )}

      {/* Create Team Modal */}
      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateTeam={handleCreateTeam}
      />
    </div>
  );
};

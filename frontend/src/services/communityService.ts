import { CommunityTeam, CommunityLeaderboardItem, CommunityEvent } from '../types';
import {
  INITIAL_COMMUNITY_TEAMS,
  INITIAL_INDIVIDUAL_LEADERBOARD,
  INITIAL_COMMUNITY_EVENTS,
} from '../mocks/mockCommunityData';
import { getStoredItem, setStoredItem } from './storage';

const TEAMS_KEY = 'community_teams';
const EVENTS_KEY = 'community_events';
const LEADERBOARD_KEY = 'community_leaderboard';

export const communityService = {
  getTeams(): CommunityTeam[] {
    return getStoredItem<CommunityTeam[]>(TEAMS_KEY, INITIAL_COMMUNITY_TEAMS);
  },

  toggleJoinTeam(teamId: string): CommunityTeam | undefined {
    const list = this.getTeams();
    const index = list.findIndex((t) => t.id === teamId);
    if (index === -1) return undefined;

    const current = list[index];
    const willJoin = !current.isMember;

    // In demo, user can only be an active member of one team at a time
    const updatedList = list.map((t) => {
      if (t.id === teamId) {
        return {
          ...t,
          isMember: willJoin,
          membersCount: willJoin ? t.membersCount + 1 : Math.max(1, t.membersCount - 1),
        };
      }
      if (willJoin && t.isMember) {
        return {
          ...t,
          isMember: false,
          membersCount: Math.max(1, t.membersCount - 1),
        };
      }
      return t;
    });

    setStoredItem(TEAMS_KEY, updatedList);
    return updatedList[index];
  },

  createTeam(teamData: {
    name: string;
    city: string;
    type: 'neighbourhood' | 'college' | 'workplace';
    description: string;
  }): CommunityTeam {
    const list = this.getTeams();
    const newTeam: CommunityTeam = {
      ...teamData,
      id: `team_${Date.now()}`,
      membersCount: 1,
      totalPoints: 2240, // includes current user points
      co2AvoidedKg: 248,
      rank: list.length + 1,
      isMember: true,
      avatarColor: 'from-emerald-700 to-green-800',
    };

    // Deactivate previous memberships
    const updatedList = list.map((t) => ({ ...t, isMember: false }));
    updatedList.unshift(newTeam);
    setStoredItem(TEAMS_KEY, updatedList);
    return newTeam;
  },

  getLeaderboard(): CommunityLeaderboardItem[] {
    return getStoredItem<CommunityLeaderboardItem[]>(LEADERBOARD_KEY, INITIAL_INDIVIDUAL_LEADERBOARD);
  },

  getEvents(): CommunityEvent[] {
    return getStoredItem<CommunityEvent[]>(EVENTS_KEY, INITIAL_COMMUNITY_EVENTS);
  },

  toggleEventRegistration(eventId: string): CommunityEvent | undefined {
    const list = this.getEvents();
    const index = list.findIndex((e) => e.id === eventId);
    if (index === -1) return undefined;

    const event = list[index];
    const willRegister = !event.isRegistered;
    const updated: CommunityEvent = {
      ...event,
      isRegistered: willRegister,
      attendeesCount: willRegister ? event.attendeesCount + 1 : Math.max(0, event.attendeesCount - 1),
    };

    const updatedList = [...list];
    updatedList[index] = updated;
    setStoredItem(EVENTS_KEY, updatedList);
    return updated;
  },
};

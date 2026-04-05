export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  bonusPoints: number;
  iconName: string; // maps to icon in ChallengesCard
  track: 'onboarding' | 'weekly' | 'stretch';
  expiresInDays: number | null;
}

export const CHALLENGES: ChallengeDefinition[] = [
  // Onboarding track (no expiry)
  {
    id: 'complete_profile',
    title: 'Complete Your Profile',
    description: 'Fill in all your profile fields',
    target: 100,
    bonusPoints: 10,
    iconName: 'user',
    track: 'onboarding',
    expiresInDays: null,
  },
  {
    id: 'first_github_sync',
    title: 'First GitHub Sync',
    description: 'Connect and sync your GitHub',
    target: 1,
    bonusPoints: 15,
    iconName: 'gitBranch',
    track: 'onboarding',
    expiresInDays: null,
  },
  {
    id: 'first_proof',
    title: 'Add Your First Proof',
    description: 'Upload a video, content, or certification',
    target: 1,
    bonusPoints: 10,
    iconName: 'clipboardCheck',
    track: 'onboarding',
    expiresInDays: null,
  },
  {
    id: 'first_vouch_given',
    title: 'Vouch for a Builder',
    description: 'Endorse another community member',
    target: 1,
    bonusPoints: 5,
    iconName: 'handshake',
    track: 'onboarding',
    expiresInDays: null,
  },

  // Stretch track (no expiry, progressive)
  {
    id: 'tool_collector_5',
    title: 'Tool Collector',
    description: 'Have 5 verified AI tools',
    target: 5,
    bonusPoints: 15,
    iconName: 'wrench',
    track: 'stretch',
    expiresInDays: null,
  },
  {
    id: 'content_machine',
    title: 'Content Machine',
    description: 'Add 5 pieces of published content',
    target: 5,
    bonusPoints: 15,
    iconName: 'penTool',
    track: 'stretch',
    expiresInDays: null,
  },
  {
    id: 'community_builder',
    title: 'Community Builder',
    description: 'Give 10 vouches to other builders',
    target: 10,
    bonusPoints: 20,
    iconName: 'users',
    track: 'stretch',
    expiresInDays: null,
  },
  {
    id: 'video_creator',
    title: 'Video Creator',
    description: 'Add 3 video proof walkthroughs',
    target: 3,
    bonusPoints: 10,
    iconName: 'video',
    track: 'stretch',
    expiresInDays: null,
  },
];

export function getChallengeDefinition(id: string): ChallengeDefinition | undefined {
  return CHALLENGES.find(c => c.id === id);
}

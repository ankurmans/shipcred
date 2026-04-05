export interface ChallengeDefinition {
  id: string;
  title: string;
  description: string;
  target: number;
  bonusPoints: number;
  icon: string;
  track: 'onboarding' | 'weekly' | 'stretch';
  expiresInDays: number | null; // null = no expiry
}

export const CHALLENGES: ChallengeDefinition[] = [
  // Onboarding track (no expiry)
  {
    id: 'complete_profile',
    title: 'Complete Your Profile',
    description: 'Fill in all your profile fields',
    target: 100,
    bonusPoints: 10,
    icon: '👤',
    track: 'onboarding',
    expiresInDays: null,
  },
  {
    id: 'first_github_sync',
    title: 'First GitHub Sync',
    description: 'Connect and sync your GitHub',
    target: 1,
    bonusPoints: 15,
    icon: '🔗',
    track: 'onboarding',
    expiresInDays: null,
  },
  {
    id: 'first_proof',
    title: 'Add Your First Proof',
    description: 'Upload a video, content, or certification',
    target: 1,
    bonusPoints: 10,
    icon: '📋',
    track: 'onboarding',
    expiresInDays: null,
  },
  {
    id: 'first_vouch_given',
    title: 'Vouch for a Builder',
    description: 'Endorse another community member',
    target: 1,
    bonusPoints: 5,
    icon: '🤝',
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
    icon: '🧰',
    track: 'stretch',
    expiresInDays: null,
  },
  {
    id: 'content_machine',
    title: 'Content Machine',
    description: 'Add 5 pieces of published content',
    target: 5,
    bonusPoints: 15,
    icon: '✍️',
    track: 'stretch',
    expiresInDays: null,
  },
  {
    id: 'community_builder',
    title: 'Community Builder',
    description: 'Give 10 vouches to other builders',
    target: 10,
    bonusPoints: 20,
    icon: '🏗️',
    track: 'stretch',
    expiresInDays: null,
  },
  {
    id: 'video_creator',
    title: 'Video Creator',
    description: 'Add 3 video proof walkthroughs',
    target: 3,
    bonusPoints: 10,
    icon: '🎬',
    track: 'stretch',
    expiresInDays: null,
  },
];

export function getChallengeDefinition(id: string): ChallengeDefinition | undefined {
  return CHALLENGES.find(c => c.id === id);
}

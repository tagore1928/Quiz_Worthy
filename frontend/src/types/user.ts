export type UserRole = 'user' | 'admin';

export interface TopicLevels {
  'Operating Systems': number;
  'Computer Networks': number;
  'DBMS': number;
  'Python': number;
  'Java': number;
  'C++': number;
  'Frontend': number;
  'Backend': number;
  'Machine Learning': number;
  'DSA': number;
  [key: string]: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  collegeName: string;
  isStudent: boolean;
  role: UserRole;
  xp: number;
  silverBadges: number;
  goldBadges: number;
  currentStreak: number;
  topicLevels: TopicLevels;
  createdAt: string;
}

export const DEFAULT_TOPIC_LEVELS: TopicLevels = {
  'Operating Systems': 2,
  'Computer Networks': 2,
  'DBMS': 2,
  'Python': 2,
  'Java': 2,
  'C++': 2,
  'Frontend': 2,
  'Backend': 2,
  'Machine Learning': 2,
  'DSA': 2,
};

export const PREDEFINED_COLLEGES = [
  'Indian Institute of Technology (IIT) Bombay',
  'Indian Institute of Technology (IIT) Delhi',
  'Indian Institute of Technology (IIT) Madras',
  'Indian Institute of Technology (IIT) Kharagpur',
  'National Institute of Technology (NIT) Trichy',
  'Birla Institute of Technology and Science (BITS) Pilani',
  'Delhi Technological University (DTU)',
  'Vellore Institute of Technology (VIT)',
  'SRM Institute of Science and Technology',
  'Manipal Institute of Technology',
];

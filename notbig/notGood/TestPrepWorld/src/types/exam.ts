export interface CommunityPost {
  user: string;
  avatar: string;
  time: string;
  text: string;
  likes: number;
}

export interface Experience {
  user: string;
  avatar: string;
  score: string;
  date: string;
  text: string;
  rating: number;
}

export interface Exam {
  id: number;
  name: string;
  community: string;
  questions: number;
  color: string;
  members: string;
  online: number;
  subjects: string[];
  tags: string[];
  description: string;
  passRate: number;
  duration: string;
  difficulty: string;
  experiences: Experience[];
  communityPosts: CommunityPost[];
}

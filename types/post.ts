export interface Post {
  id: number;
  user: {
    id: number;
    displayName: string;
    photoUrl?: string;
  };
  caption: string;
  image?: string;
  location?: {
    placeName: string;
    latitude: number;
    longitude: number;
  };
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  createdAt: string;
}

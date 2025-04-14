export interface Platform {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}

export interface Followers {
  youtube?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  github?: string;
}

export interface Influencer {
  id: string;
  name: string;
  image: string;
  description: string;
  platforms: Platform;
  specialties: string[];
  followers: Followers;
}

export interface InfluencersData {
  influencers: Influencer[];
}

export type TeamSlug = "boys" | "girls";

export interface Team {
  slug: TeamSlug;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  coachName: string;
  coachRole: string;
  foundedYear: number;
  colors: {
    primary: string;
    secondary: string;
  };
}

export type PlayerPosition =
  | "Goalkeeper"
  | "Defender"
  | "Midfielder"
  | "Forward";

export interface Player {
  slug: string;
  team: TeamSlug;
  name: string;
  number: number;
  position: PlayerPosition;
  bio: string;
  photoUrl?: string;
  joinedYear: number;
  hometown?: string;
  isCaptain?: boolean;
}

export interface NewsItem {
  slug: string;
  title: string;
  date: string;
  summary: string;
  body: string;
  team?: TeamSlug | "both";
  coverImage?: string;
}

export interface ClubInfo {
  name: string;
  shortName: string;
  foundedYear: number;
  city: string;
  country: string;
  motto: string;
  values: string[];
  mission: string;
  email: string;
  instagram?: string;
  whatsapp?: string;
  address: string;
}

export interface ClubRole {
  slug: string;
  title: string;
  reportsTo: string;
  summary: string;
  duties: string[];
}

export interface MembershipTier {
  slug: string;
  name: string;
  description: string;
  friendlies: string;
  tournaments: string;
}

export type ProductCategory = "Cap" | "Tote Bag";

export interface Product {
  slug: string;
  name: string;
  category: ProductCategory;
  artVariant: "cap" | "tote";
  price: number;
  currency: string;
  colorway: string;
  description: string;
}


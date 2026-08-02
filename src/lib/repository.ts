import clubJson from "./data/club.json";
import teamsJson from "./data/teams.json";
import playersJson from "./data/players.json";
import newsJson from "./data/news.json";
import rolesJson from "./data/roles.json";
import membershipTiersJson from "./data/membership-tiers.json";
import { db } from "./db";
import type {
  ClubInfo,
  ClubRole,
  MembershipTier,
  NewsItem,
  Player,
  Product,
  Team,
  TeamSlug,
} from "./types";

/**
 * All reads are async so this interface can later be backed by a real
 * database/CMS without changing any page/component code.
 */
export interface ClubRepository {
  getClubInfo(): Promise<ClubInfo>;
  getTeams(): Promise<Team[]>;
  getTeam(slug: TeamSlug): Promise<Team | undefined>;
  getPlayers(team?: TeamSlug): Promise<Player[]>;
  getPlayer(slug: string): Promise<Player | undefined>;
  getNews(team?: TeamSlug): Promise<NewsItem[]>;
  getNewsItem(slug: string): Promise<NewsItem | undefined>;
  getClubRoles(): Promise<ClubRole[]>;
  getMembershipTiers(): Promise<MembershipTier[]>;
  getProducts(): Promise<Product[]>;
  getProduct(slug: string): Promise<Product | undefined>;
}

class JsonClubRepository implements ClubRepository {
  async getClubInfo(): Promise<ClubInfo> {
    return clubJson as ClubInfo;
  }

  async getTeams(): Promise<Team[]> {
    return teamsJson as Team[];
  }

  async getTeam(slug: TeamSlug): Promise<Team | undefined> {
    return (teamsJson as Team[]).find((t) => t.slug === slug);
  }

  async getPlayers(team?: TeamSlug): Promise<Player[]> {
    const players = playersJson as Player[];
    const filtered = team ? players.filter((p) => p.team === team) : players;
    return [...filtered].sort((a, b) => a.number - b.number);
  }

  async getPlayer(slug: string): Promise<Player | undefined> {
    return (playersJson as Player[]).find((p) => p.slug === slug);
  }

  async getNews(team?: TeamSlug): Promise<NewsItem[]> {
    const news = [...(newsJson as NewsItem[])].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    return team ? news.filter((n) => n.team === team || n.team === "both") : news;
  }

  async getNewsItem(slug: string): Promise<NewsItem | undefined> {
    return (newsJson as NewsItem[]).find((n) => n.slug === slug);
  }

  async getClubRoles(): Promise<ClubRole[]> {
    return rolesJson as ClubRole[];
  }

  async getMembershipTiers(): Promise<MembershipTier[]> {
    return membershipTiersJson as MembershipTier[];
  }

  async getProducts(): Promise<Product[]> {
    const products = await db.product.findMany({
      where: { active: true },
      orderBy: { createdAt: "asc" },
    });
    return products as Product[];
  }

  async getProduct(slug: string): Promise<Product | undefined> {
    const product = await db.product.findUnique({ where: { slug } });
    return (product as Product) ?? undefined;
  }
}

export const repository: ClubRepository = new JsonClubRepository();

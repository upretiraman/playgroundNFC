import clubJson from "./data/club.json";
import teamsJson from "./data/teams.json";
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
  /**
   * `includeUnpublished` is for internal dashboard use (attendance,
   * scheduling, linking a roster entry to an account) — public pages must
   * leave it unset so an unpublished profile stays off the public site.
   */
  getPlayers(
    team?: TeamSlug,
    opts?: { includeUnpublished?: boolean }
  ): Promise<Player[]>;
  getPlayer(
    slug: string,
    opts?: { includeUnpublished?: boolean }
  ): Promise<Player | undefined>;
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

  async getPlayers(
    team?: TeamSlug,
    opts: { includeUnpublished?: boolean } = {}
  ): Promise<Player[]> {
    const players = await db.player.findMany({
      where: {
        ...(team ? { team } : {}),
        ...(opts.includeUnpublished ? {} : { published: true }),
      },
      orderBy: { number: "asc" },
    });
    return players as Player[];
  }

  async getPlayer(
    slug: string,
    opts: { includeUnpublished?: boolean } = {}
  ): Promise<Player | undefined> {
    const player = await db.player.findUnique({ where: { slug } });
    if (!player) return undefined;
    if (!player.published && !opts.includeUnpublished) return undefined;
    return player as Player;
  }

  async getNews(team?: TeamSlug): Promise<NewsItem[]> {
    const news = await db.newsItem.findMany({
      where: team ? { OR: [{ team }, { team: "both" }] } : undefined,
      orderBy: { date: "desc" },
    });
    return news.map((n) => ({ ...n, date: n.date.toISOString() })) as NewsItem[];
  }

  async getNewsItem(slug: string): Promise<NewsItem | undefined> {
    const item = await db.newsItem.findUnique({ where: { slug } });
    if (!item) return undefined;
    return { ...item, date: item.date.toISOString() } as NewsItem;
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

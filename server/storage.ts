import { users, type User, type InsertUser, type Client, type Fund } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);
const MemoryStore = createMemoryStore(session);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

type ClientWithPortfolio = Client & {
  portfolioValue: number;
  fundCount: number;
};

type PortfolioSummary = {
  totalAum: number;
  totalClients: number;
  totalCommission: number;
  amountInvested: number;
  xirr: number;
  growthData: { month: string; aum: number }[];
};

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getClientsWithPortfolio(userId: number): Promise<ClientWithPortfolio[]>;
  getPortfolioSummary(userId: number): Promise<PortfolioSummary>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private clients: Map<number, Client> = new Map();
  private funds: Map<number, Fund> = new Map();
  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    });

    // Initialize with hashed password for Chinmay
    (async () => {
      const hashedPassword = await hashPassword("qwertyuiop");
      const chinmay: User = {
        id: 1,
        username: "Chinmay",
        password: hashedPassword
      };
      this.users.set(chinmay.id, chinmay);

      // Add sample clients including Ramesh
      const sampleClients: Client[] = [
        {
          id: 1,
          userId: chinmay.id,
          name: "Rahul Sharma",
          email: "rahul@example.com",
          phone: "+91 98765 43210",
          panNumber: "ABCDE1234F",
          kycStatus: true,
          createdAt: new Date()
        },
        {
          id: 2,
          userId: chinmay.id,
          name: "Priya Patel",
          email: "priya@example.com",
          phone: "+91 98765 43211",
          panNumber: "FGHIJ5678K",
          kycStatus: true,
          createdAt: new Date()
        },
        {
          id: 3,
          userId: chinmay.id,
          name: "Ramesh Kumar",
          email: "ramesh@example.com",
          phone: "+91 98765 43212",
          panNumber: "LMNOP7890Q",
          kycStatus: true,
          createdAt: new Date()
        }
      ];

      sampleClients.forEach(client => this.clients.set(client.id, client));
    })();
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      return this.users.get(id);
    } catch (error) {
      console.error("Error getting user by ID:", error);
      throw error;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      return Array.from(this.users.values()).find(
        (user) => user.username === username,
      );
    } catch (error) {
      console.error("Error getting user by username:", error);
      throw error;
    }
  }

  async createClient(clientData: Partial<Client>): Promise<Client> {
    try {
      const newId = Math.max(...Array.from(this.clients.keys())) + 1;
      const newClient: Client = {
        id: newId,
        ...clientData,
      } as Client;
      
      this.clients.set(newId, newClient);
      return newClient;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const id = this.currentId++;
      const hashedPassword = await hashPassword(insertUser.password);
      const user: User = { ...insertUser, id, password: hashedPassword };
      this.users.set(id, user);
      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getClientsWithPortfolio(userId: number): Promise<ClientWithPortfolio[]> {
    try {
      const userClients = Array.from(this.clients.values())
        .filter(client => client.userId === userId)
        .map(client => ({
          ...client,
          portfolioValue: Math.random() * 10000000, // Sample data
          fundCount: Math.floor(Math.random() * 10) + 1 // Sample data
        }));
      return userClients;
    } catch (error) {
      console.error("Error getting clients with portfolio:", error);
      throw error;
    }
  }

  async getPortfolioSummary(userId: number): Promise<PortfolioSummary> {
    try {
      // Generate sample growth data for the last 6 months
      const growthData = Array.from({ length: 6 }, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - (5 - i));
        return {
          month: date.toLocaleString('default', { month: 'short' }),
          aum: Math.random() * 50000000 + 10000000
        };
      });

      return {
        totalAum: 45000000, // Sample data: 4.5 Cr
        totalClients: Array.from(this.clients.values()).filter(c => c.userId === userId).length,
        totalCommission: 450000, // Sample data: 4.5 Lakh
        amountInvested: 38000000, // Sample data: 3.8 Cr
        xirr: 18.5, // Sample data: 18.5%
        growthData
      };
    } catch (error) {
      console.error("Error getting portfolio summary:", error);
      throw error;
    }
  }
}

export const storage = new MemStorage();
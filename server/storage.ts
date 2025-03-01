import { IStorage } from "./types";
import { User, InsertUser, Credit, Project } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private credits: Map<number, Credit>;
  private projects: Map<number, Project>;
  sessionStore: session.Store;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.credits = new Map();
    this.projects = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Seed some initial projects
    this.seedProjects();
  }

  private seedProjects() {
    const projectsData = [
      {
        id: 1,
        name: "Amazon Rainforest Conservation",
        description: "Protecting vital rainforest ecosystems",
        location: "Brazil",
        credits: "10000",
        price: "25",
        imageUrl: "https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07",
      },
      {
        id: 2,
        name: "Wind Farm Initiative",
        description: "Clean energy generation project",
        location: "Texas, USA",
        credits: "5000",
        price: "20",
        imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
      },
    ];

    projectsData.forEach(project => {
      this.projects.set(project.id, project);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user = { ...insertUser, id, balance: "1000" };
    this.users.set(id, user);
    return user;
  }

  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createCredit(credit: Omit<Credit, "id">): Promise<Credit> {
    const id = this.currentId++;
    const newCredit = { ...credit, id };
    this.credits.set(id, newCredit);
    return newCredit;
  }

  async getUserCredits(userId: number): Promise<Credit[]> {
    return Array.from(this.credits.values()).filter(
      (credit) => credit.userId === userId,
    );
  }

  async updateUserBalance(userId: number, amount: string): Promise<void> {
    const user = await this.getUser(userId);
    if (user) {
      user.balance = amount;
      this.users.set(userId, user);
    }
  }
}

export const storage = new MemStorage();
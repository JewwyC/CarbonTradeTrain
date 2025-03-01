import { User, InsertUser, Credit, Project } from "@shared/schema";
import { Store } from "express-session";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getProjects(): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createCredit(credit: Omit<Credit, "id">): Promise<Credit>;
  getUserCredits(userId: number): Promise<Credit[]>;
  updateUserBalance(userId: number, amount: string): Promise<void>;
  sessionStore: Store;
}

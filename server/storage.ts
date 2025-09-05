import { type User, type InsertUser, type TaskLog, type InsertTaskLog, users, taskLogs } from "@shared/schema";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(name: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  deleteUser(name: string): Promise<boolean>;
  updateUserTasks(name: string, tasks: string[]): Promise<User | undefined>;
  
  // Task log operations
  createTaskLog(log: InsertTaskLog): Promise<TaskLog>;
  getTaskLogs(): Promise<TaskLog[]>;
  getTaskLogsByUser(user: string): Promise<TaskLog[]>;
  clearAllTaskLogs(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private taskLogs: Map<string, TaskLog>;

  constructor() {
    this.users = new Map();
    this.taskLogs = new Map();
    
    // Initialize with some sample data
    this.initializeData();
  }

  private async initializeData() {
    // Add some sample users
    await this.createUser({
      name: "John Doe",
      project: "E-Commerce Platform Redesign",
      tasks: ["Wireframe Review", "User Testing Session", "Prototype Development"]
    });
    
    await this.createUser({
      name: "Jane Smith", 
      project: "Mobile App Development",
      tasks: ["Design Documentation", "User Research", "Prototype Testing"]
    });
    
    await this.createUser({
      name: "Mike Johnson",
      project: "Dashboard Analytics",
      tasks: ["Data Visualization", "Performance Optimization", "User Interface Design"]
    });
  }

  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(name: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.name === name);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      tasks: insertUser.tasks || []
    };
    this.users.set(id, user);
    return user;
  }

  async deleteUser(name: string): Promise<boolean> {
    const user = await this.getUser(name);
    if (user) {
      this.users.delete(user.id);
      return true;
    }
    return false;
  }

  async updateUserTasks(name: string, tasks: string[]): Promise<User | undefined> {
    const user = await this.getUser(name);
    if (user) {
      user.tasks = tasks;
      this.users.set(user.id, user);
      return user;
    }
    return undefined;
  }

  async createTaskLog(insertLog: InsertTaskLog): Promise<TaskLog> {
    const id = randomUUID();
    const log: TaskLog = {
      ...insertLog,
      id,
      status: insertLog.status || "COMPLETED",
      comment: insertLog.comment || null,
      timestamp: new Date(),
    };
    this.taskLogs.set(id, log);
    return log;
  }

  async getTaskLogs(): Promise<TaskLog[]> {
    return Array.from(this.taskLogs.values()).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  async getTaskLogsByUser(user: string): Promise<TaskLog[]> {
    return Array.from(this.taskLogs.values())
      .filter(log => log.user === user)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async clearAllTaskLogs(): Promise<void> {
    this.taskLogs.clear();
  }
}

// Database connection
const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export class DbStorage implements IStorage {
  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getUser(name: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.name, name));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async deleteUser(name: string): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.name, name)).returning();
    return result.length > 0;
  }

  async updateUserTasks(name: string, tasks: string[]): Promise<User | undefined> {
    const result = await db.update(users)
      .set({ tasks })
      .where(eq(users.name, name))
      .returning();
    return result[0];
  }

  async createTaskLog(insertLog: InsertTaskLog): Promise<TaskLog> {
    const result = await db.insert(taskLogs).values(insertLog).returning();
    return result[0];
  }

  async getTaskLogs(): Promise<TaskLog[]> {
    return await db.select().from(taskLogs);
  }

  async getTaskLogsByUser(user: string): Promise<TaskLog[]> {
    return await db.select().from(taskLogs).where(eq(taskLogs.user, user));
  }

  async clearAllTaskLogs(): Promise<void> {
    await db.delete(taskLogs);
  }

  // Initialize with sample data only if database is empty
  async initializeData(): Promise<void> {
    const existingUsers = await this.getUsers();
    if (existingUsers.length === 0) {
      // Add sample users only if database is empty
      await this.createUser({
        name: "John Doe",
        project: "E-Commerce Platform Redesign", 
        tasks: ["Wireframe Review", "User Testing Session", "Prototype Development"]
      });
      
      await this.createUser({
        name: "Jane Smith",
        project: "Mobile App Development",
        tasks: ["Design Documentation", "User Research", "Prototype Testing"]
      });
      
      await this.createUser({
        name: "Mike Johnson",
        project: "Dashboard Analytics",
        tasks: ["Data Visualization", "Performance Optimization", "User Interface Design"]
      });
    }
  }
}

// Use database storage instead of memory storage
export const storage = new DbStorage();

// Initialize data when module is loaded
storage.initializeData().catch(console.error);

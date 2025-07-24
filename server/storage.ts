import { 
  users, 
  contactSubmissions,
  newsletterSubscriptions,
  courseEnrollments,
  type User, 
  type InsertUser,
  type ContactSubmission,
  type InsertContactSubmission,
  type NewsletterSubscription,
  type InsertNewsletterSubscription,
  type CourseEnrollment,
  type InsertCourseEnrollment
} from "@shared/schema";
import { db, COLLECTIONS } from "./firebase";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContactSubmission(submission: InsertContactSubmission): Promise<ContactSubmission>;
  createNewsletterSubscription(subscription: InsertNewsletterSubscription): Promise<NewsletterSubscription>;
  createCourseEnrollment(enrollment: InsertCourseEnrollment): Promise<CourseEnrollment>;
  getAllContactSubmissions(): Promise<ContactSubmission[]>;
  getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]>;
  getAllCourseEnrollments(): Promise<CourseEnrollment[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contactSubmissions: Map<number, ContactSubmission>;
  private newsletterSubscriptions: Map<number, NewsletterSubscription>;
  private courseEnrollments: Map<number, CourseEnrollment>;
  currentId: number;

  constructor() {
    this.users = new Map();
    this.contactSubmissions = new Map();
    this.newsletterSubscriptions = new Map();
    this.courseEnrollments = new Map();
    this.currentId = 1;
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
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    const id = this.currentId++;
    const submission: ContactSubmission = {
      ...insertSubmission,
      id,
      createdAt: new Date(),
    };
    this.contactSubmissions.set(id, submission);
    return submission;
  }

  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    // Check if email already exists
    const existing = Array.from(this.newsletterSubscriptions.values()).find(
      (sub) => sub.email === insertSubscription.email,
    );
    if (existing) {
      throw new Error("Email already subscribed");
    }

    const id = this.currentId++;
    const subscription: NewsletterSubscription = {
      ...insertSubscription,
      id,
      createdAt: new Date(),
    };
    this.newsletterSubscriptions.set(id, subscription);
    return subscription;
  }

  async createCourseEnrollment(insertEnrollment: InsertCourseEnrollment): Promise<CourseEnrollment> {
    const id = this.currentId++;
    const enrollment: CourseEnrollment = {
      ...insertEnrollment,
      id,
      createdAt: new Date(),
    };
    this.courseEnrollments.set(id, enrollment);
    return enrollment;
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    return Array.from(this.contactSubmissions.values());
  }

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    return Array.from(this.newsletterSubscriptions.values());
  }

  async getAllCourseEnrollments(): Promise<CourseEnrollment[]> {
    return Array.from(this.courseEnrollments.values());
  }
}

export class FirebaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    try {
      const userRef = db.collection(COLLECTIONS.USERS).doc(id.toString());
      const doc = await userRef.get();
      if (doc.exists) {
        return { id, ...doc.data() } as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const usersRef = db.collection(COLLECTIONS.USERS);
      const snapshot = await usersRef.where('username', '==', username).limit(1).get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: parseInt(doc.id), ...doc.data() } as User;
      }
      return undefined;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return undefined;
    }
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    try {
      const userRef = await db.collection(COLLECTIONS.USERS).add(insertUser);
      const id = parseInt(userRef.id);
      return { id, ...insertUser };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async createContactSubmission(insertSubmission: InsertContactSubmission): Promise<ContactSubmission> {
    try {
      const submissionData = {
        ...insertSubmission,
        createdAt: new Date()
      };
      const docRef = await db.collection(COLLECTIONS.CONTACTS).add(submissionData);
      return { 
        id: parseInt(docRef.id) || Date.now(), // Fallback ID if parsing fails
        ...submissionData 
      };
    } catch (error) {
      console.error('Error creating contact submission:', error);
      throw error;
    }
  }

  async createNewsletterSubscription(insertSubscription: InsertNewsletterSubscription): Promise<NewsletterSubscription> {
    try {
      // Check if email already exists
      const existingQuery = await db.collection(COLLECTIONS.NEWSLETTER)
        .where('email', '==', insertSubscription.email)
        .limit(1)
        .get();
      
      if (!existingQuery.empty) {
        throw new Error("Email already subscribed");
      }

      const subscriptionData = {
        ...insertSubscription,
        createdAt: new Date()
      };
      const docRef = await db.collection(COLLECTIONS.NEWSLETTER).add(subscriptionData);
      return { 
        id: parseInt(docRef.id) || Date.now(),
        ...subscriptionData 
      };
    } catch (error) {
      console.error('Error creating newsletter subscription:', error);
      throw error;
    }
  }

  async createCourseEnrollment(insertEnrollment: InsertCourseEnrollment): Promise<CourseEnrollment> {
    try {
      const enrollmentData = {
        ...insertEnrollment,
        createdAt: new Date()
      };
      const docRef = await db.collection(COLLECTIONS.ENROLLMENTS).add(enrollmentData);
      return { 
        id: parseInt(docRef.id) || Date.now(),
        ...enrollmentData 
      };
    } catch (error) {
      console.error('Error creating course enrollment:', error);
      throw error;
    }
  }

  async getAllContactSubmissions(): Promise<ContactSubmission[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.CONTACTS)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id) || Date.now(),
        ...doc.data()
      })) as ContactSubmission[];
    } catch (error) {
      console.error('Error getting contact submissions:', error);
      return [];
    }
  }

  async getAllNewsletterSubscriptions(): Promise<NewsletterSubscription[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.NEWSLETTER)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id) || Date.now(),
        ...doc.data()
      })) as NewsletterSubscription[];
    } catch (error) {
      console.error('Error getting newsletter subscriptions:', error);
      return [];
    }
  }

  async getAllCourseEnrollments(): Promise<CourseEnrollment[]> {
    try {
      const snapshot = await db.collection(COLLECTIONS.ENROLLMENTS)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({
        id: parseInt(doc.id) || Date.now(),
        ...doc.data()
      })) as CourseEnrollment[];
    } catch (error) {
      console.error('Error getting course enrollments:', error);
      return [];
    }
  }
}

// Use Firebase storage in production, Memory storage for development without Firebase
export const storage = process.env.NODE_ENV === 'production' || process.env.USE_FIREBASE 
  ? new FirebaseStorage() 
  : new MemStorage();

// Mock database for development and testing
export interface MockUser {
  fid: string;
  walletAddress?: string;
  totalPoints: number;
  referrerFid?: string;
  createdAt: Date;
  lastUpdated: Date;
}

export interface MockPointTransaction {
  id: string;
  fid: string;
  amount: number;
  source:
    | "wallet_confirmation"
    | "follow"
    | "channel_join"
    | "referral"
    | "manual";
  description: string;
  createdAt: Date;
}

// In-memory storage
const users: Map<string, MockUser> = new Map();
const pointTransactions: Map<string, MockPointTransaction[]> = new Map();

// Initialize with some mock data
const initializeMockData = () => {
  // Add a default user
  const defaultUser: MockUser = {
    fid: "12345",
    walletAddress: undefined,
    totalPoints: 1250,
    referrerFid: undefined,
    createdAt: new Date(),
    lastUpdated: new Date(),
  };

  users.set("12345", defaultUser);

  // Add some point transactions
  const transactions: MockPointTransaction[] = [
    {
      id: "tx_1",
      fid: "12345",
      amount: 1000,
      source: "manual",
      description: "Initial points",
      createdAt: new Date(),
    },
    {
      id: "tx_2",
      fid: "12345",
      amount: 250,
      source: "follow",
      description: "Followed @beamer",
      createdAt: new Date(),
    },
  ];

  pointTransactions.set("12345", transactions);
};

// Initialize on module load
initializeMockData();

export const mockDB = {
  // User operations
  getUser: (fid: string): MockUser | null => {
    return users.get(fid) || null;
  },

  createUser: (fid: string, referrerFid?: string): MockUser => {
    const user: MockUser = {
      fid,
      walletAddress: undefined,
      totalPoints: 0,
      referrerFid,
      createdAt: new Date(),
      lastUpdated: new Date(),
    };
    users.set(fid, user);
    pointTransactions.set(fid, []);
    return user;
  },

  updateUser: (fid: string, updates: Partial<MockUser>): MockUser | null => {
    const user = users.get(fid);
    if (!user) return null;

    const updatedUser = {
      ...user,
      ...updates,
      lastUpdated: new Date(),
    };
    users.set(fid, updatedUser);
    return updatedUser;
  },

  // Points operations
  addPoints: (
    fid: string,
    amount: number,
    source: MockPointTransaction["source"],
    description: string
  ): MockPointTransaction => {
    const user = users.get(fid);
    if (!user) throw new Error(`User ${fid} not found`);

    const transaction: MockPointTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fid,
      amount,
      source,
      description,
      createdAt: new Date(),
    };

    // Add transaction
    const transactions = pointTransactions.get(fid) || [];
    transactions.push(transaction);
    pointTransactions.set(fid, transactions);

    // Update user total
    const updatedUser = {
      ...user,
      totalPoints: user.totalPoints + amount,
      lastUpdated: new Date(),
    };
    users.set(fid, updatedUser);

    return transaction;
  },

  getUserTransactions: (fid: string): MockPointTransaction[] => {
    return pointTransactions.get(fid) || [];
  },

  // Utility functions
  getAllUsers: (): MockUser[] => {
    return Array.from(users.values());
  },

  getUsersByReferrer: (referrerFid: string): MockUser[] => {
    return Array.from(users.values()).filter(
      (user) => user.referrerFid === referrerFid
    );
  },

  // Check if user has already performed an action (to prevent duplicate points)
  hasUserAction: (
    fid: string,
    source: MockPointTransaction["source"]
  ): boolean => {
    const transactions = pointTransactions.get(fid) || [];
    return transactions.some((tx) => tx.source === source);
  },
};

// Point values configuration
export const POINT_VALUES = {
  WALLET_CONFIRMATION: 250,
  FOLLOW: 100,
  CHANNEL_JOIN: 150,
  REFERRAL: 500,
  REFERRAL_BONUS: 100, // Bonus for the referrer
} as const;

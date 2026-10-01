import fs from 'fs';
import path from 'path';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  full_name: string;
  created_at: string;
}

interface DBData {
  users: User[];
}

const DB_FILE = path.resolve(process.cwd(), 'data/spotify_db.json');

const INITIAL_USERS: User[] = [
  {
    id: 1,
    username: 'vishnu',
    email: 'vishnu@example.com',
    password: 'password123',
    full_name: 'Vishnu Nair',
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    username: 'demouser',
    email: 'demo@spotify.com',
    password: 'demo123',
    full_name: 'Demo Listener',
    created_at: new Date().toISOString()
  }
];

function initDB(): DBData {
  if (!fs.existsSync(DB_FILE)) {
    const initialData: DBData = {
      users: INITIAL_USERS
    };
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { users: INITIAL_USERS };
  }
}

let dbData: DBData = initDB();

function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed saving DB file', err);
  }
}

export const db = {
  // 1. Fetch all users from the DB
  getAllUsers() {
    return dbData.users;
  },

  // 2. Fetch specific user details by ID
  getUserById(id: number) {
    return dbData.users.find(u => u.id === id) || null;
  },

  // 3. Fetch specific user details by Email or Username
  getUserByEmailOrUsername(identifier: string) {
    const clean = identifier.trim().toLowerCase();
    return dbData.users.find(u => u.email.toLowerCase() === clean || u.username.toLowerCase() === clean) || null;
  },

  // 4. Store new user credentials in the DB (Sign Up)
  createUser(userData: { full_name: string; username: string; email: string; password: string }) {
    const cleanEmail = userData.email.trim().toLowerCase();
    const cleanUsername = userData.username.trim().toLowerCase();

    const existing = dbData.users.find(
      u => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === cleanUsername
    );

    if (existing) {
      throw new Error('An account with this email or username already exists in the database.');
    }

    const nextId = dbData.users.length > 0 ? Math.max(...dbData.users.map(u => u.id)) + 1 : 1;
    const newUser: User = {
      id: nextId,
      full_name: userData.full_name.trim(),
      username: userData.username.trim(),
      email: cleanEmail,
      password: userData.password.trim(),
      created_at: new Date().toISOString()
    };

    dbData.users.push(newUser);
    saveDB();
    return newUser;
  },

  // 5. Verify credentials on Sign In / Login and return user details
  verifyLogin(usernameOrEmail: string, password: string) {
    const user = this.getUserByEmailOrUsername(usernameOrEmail);
    if (!user) {
      return null;
    }
    if (user.password !== password.trim()) {
      return null;
    }
    return user;
  }
};

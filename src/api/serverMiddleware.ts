import type { Plugin, ViteDevServer } from 'vite';
import { db } from './db.ts';
import url from 'url';

export function databaseApiPlugin(): Plugin {
  return {
    name: 'database-api-plugin',
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const parsedUrl = url.parse(req.url || '', true);
        const pathname = parsedUrl.pathname || '';

        // Only handle user auth and user details endpoints
        if (!pathname.startsWith('/api/') && !pathname.endsWith('Servlet')) {
          return next();
        }

        // Helper to read JSON or urlencoded body
        const readBody = async (): Promise<any> => {
          return new Promise((resolve) => {
            let body = '';
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
              if (!body) return resolve({});
              try {
                resolve(JSON.parse(body));
              } catch {
                const params = new URLSearchParams(body);
                const obj: Record<string, string> = {};
                params.forEach((v, k) => { obj[k] = v; });
                resolve(obj);
              }
            });
          });
        };

        const sendJson = (statusCode: number, data: any) => {
          res.statusCode = statusCode;
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          res.end(JSON.stringify(data));
        };

        if (req.method === 'OPTIONS') {
          res.statusCode = 204;
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
          return res.end();
        }

        try {
          // 1. Sign Up (Store new user credentials in database)
          if (pathname === '/api/register' || pathname === '/RegisterServlet') {
            if (req.method !== 'POST') return sendJson(405, { success: false, message: 'Method not allowed' });
            const body = await readBody();
            const fullName = body.fullName || body.full_name;
            const username = body.username;
            const email = body.email;
            const password = body.password;

            if (!fullName || !username || !email || !password) {
              return sendJson(400, { success: false, message: 'Full Name, Username, Email, and Password are required.' });
            }

            try {
              const newUser = db.createUser({
                full_name: fullName,
                username,
                email,
                password
              });

              return sendJson(201, {
                success: true,
                message: 'User credentials stored successfully in database!',
                user: {
                  id: newUser.id,
                  username: newUser.username,
                  email: newUser.email,
                  fullName: newUser.full_name,
                  createdAt: newUser.created_at
                }
              });
            } catch (err: any) {
              return sendJson(409, { success: false, message: err.message || 'Registration failed.' });
            }
          }

          // 2. Sign In (Verify credentials and fetch user details from database)
          if (pathname === '/api/login' || pathname === '/LoginServlet') {
            if (req.method !== 'POST') return sendJson(405, { success: false, message: 'Method not allowed' });
            const body = await readBody();
            const usernameOrEmail = body.usernameOrEmail || body.username || body.email;
            const password = body.password;

            if (!usernameOrEmail || !password) {
              return sendJson(400, { success: false, message: 'Username/Email and Password are required.' });
            }

            const user = db.verifyLogin(usernameOrEmail, password);
            if (!user) {
              return sendJson(401, { success: false, message: 'Invalid username/email or password.' });
            }

            return sendJson(200, {
              success: true,
              message: 'Login successful! Verified against database credentials.',
              user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name,
                createdAt: user.created_at
              }
            });
          }

          // 3. Fetch User Details by ID or Email
          if (pathname === '/api/user') {
            const userId = parsedUrl.query.id ? parseInt(parsedUrl.query.id as string, 10) : null;
            const emailOrUser = (parsedUrl.query.email || parsedUrl.query.username) as string;

            let user = null;
            if (userId) {
              user = db.getUserById(userId);
            } else if (emailOrUser) {
              user = db.getUserByEmailOrUsername(emailOrUser);
            }

            if (!user) {
              return sendJson(404, { success: false, message: 'User not found in database.' });
            }

            const { password, ...safeDetails } = user;
            return sendJson(200, {
              success: true,
              user: safeDetails
            });
          }

          // 4. Fetch All Users in Database
          if (pathname === '/api/users') {
            const users = db.getAllUsers().map(({ password, ...u }) => u);
            return sendJson(200, {
              success: true,
              total: users.length,
              users
            });
          }

          return next();
        } catch (error: any) {
          console.error('API Error:', error);
          return sendJson(500, { success: false, message: 'Server error: ' + error.message });
        }
      });
    }
  };
}

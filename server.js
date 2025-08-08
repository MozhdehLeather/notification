const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const fs = require('fs');

// Custom middleware to modify requests/responses
server.use(middlewares);
server.use(jsonServer.bodyParser);

// ========================
// Authentication Middleware
// ========================
server.use((req, res, next) => {
  // Skip auth for GET requests
  if (req.method !== 'GET' && req.headers.authorization !== 'temple@123') {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// ========================
// Notification Sorting Logic
// ========================
router.render = (req, res) => {
  if (req.path === '/notifications') {
    // Sort by createdAt descending (newest first)
    const data = res.locals.data.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.jsonp(data);
  } else {
    res.jsonp(res.locals.data);
  }
};

// ========================
// Custom POST Handling
// ========================
server.post('/notifications', (req, res, next) => {
  // Add automatic timestamp
  req.body.createdAt = new Date().toISOString();
  // Add default active status
  req.body.isActive = true;
  // Continue to default JSON Server handler
  next();
});

// ========================
// Database Initialization
// ========================
const initializeDB = () => {
  const dbPath = 'db.json';
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ notifications: [] }));
    console.log('Created new empty database');
  }
};

// ========================
// Start Server
// ========================
server.use(router);

server.listen(3000, () => {
  initializeDB();
  console.log(`
  🚀 JSON Server is running on http://localhost:3000
  
  ==== Key Endpoints ====
  GET    /notifications      - List all (newest first)
  POST   /notifications      - Create new
  PATCH  /notifications/:id  - Update
  DELETE /notifications/:id  - Remove
  
  Admin Key: "temple@123"
  `);
});
# SQLite Connector Examples

## Basic Usage

```javascript
const SQLiteConnector = require('@shared-modules/sqlite-connector');

// Create instance
const db = new SQLiteConnector({
  path: './data/app.db',
  verbose: true // Enable logging
});

// Connect
await db.connect();

// Create table
await db.createTable('users', {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  username: 'TEXT UNIQUE NOT NULL',
  email: 'TEXT NOT NULL',
  created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
});

// Insert data
const result = await db.query(
  'INSERT INTO users (username, email) VALUES (?, ?)',
  ['john_doe', 'john@example.com']
);
console.log('New user ID:', result.lastID);

// Query data
const users = await db.query('SELECT * FROM users');
console.log('All users:', users);

// Close connection
await db.close();
```

## In-Memory Database

```javascript
const db = new SQLiteConnector({ memory: true });
await db.connect();

// Perfect for testing - no file cleanup needed
await db.query('CREATE TABLE temp (id INTEGER, data TEXT)');
await db.query('INSERT INTO temp VALUES (1, "test")');

const data = await db.get('SELECT * FROM temp WHERE id = 1');
console.log(data); // { id: 1, data: 'test' }

await db.close();
```

## Transactions

```javascript
const db = new SQLiteConnector({ path: './bank.db' });
await db.connect();

// Setup
await db.query(`
  CREATE TABLE IF NOT EXISTS accounts (
    id INTEGER PRIMARY KEY,
    balance DECIMAL(10,2) NOT NULL
  )
`);

// Transfer money between accounts
try {
  await db.transaction(async (tx) => {
    const amount = 100;
    const fromAccount = 1;
    const toAccount = 2;
    
    // Check balance
    const sender = await tx.get(
      'SELECT balance FROM accounts WHERE id = ?',
      [fromAccount]
    );
    
    if (sender.balance < amount) {
      throw new Error('Insufficient funds');
    }
    
    // Perform transfer
    await tx.query(
      'UPDATE accounts SET balance = balance - ? WHERE id = ?',
      [amount, fromAccount]
    );
    
    await tx.query(
      'UPDATE accounts SET balance = balance + ? WHERE id = ?',
      [amount, toAccount]
    );
  });
  
  console.log('Transfer successful');
} catch (error) {
  console.error('Transfer failed:', error.message);
  // Transaction automatically rolled back
}

await db.close();
```

## Task Management System

```javascript
const db = new SQLiteConnector({ path: './tasks.db' });
await db.connect();

// Create schema
await db.createTable('projects', {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  name: 'TEXT NOT NULL',
  created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
});

await db.createTable('tasks', {
  id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
  project_id: 'INTEGER NOT NULL',
  title: 'TEXT NOT NULL',
  status: 'TEXT DEFAULT "pending"',
  priority: 'INTEGER DEFAULT 0',
  'FOREIGN KEY (project_id)': 'REFERENCES projects(id)'
});

// Create project
const project = await db.query(
  'INSERT INTO projects (name) VALUES (?)',
  ['My Project']
);

// Add tasks
const tasks = [
  { title: 'Setup database', priority: 1 },
  { title: 'Create API', priority: 2 },
  { title: 'Build UI', priority: 3 }
];

for (const task of tasks) {
  await db.query(
    'INSERT INTO tasks (project_id, title, priority) VALUES (?, ?, ?)',
    [project.lastID, task.title, task.priority]
  );
}

// Get project with tasks
const projectTasks = await db.query(`
  SELECT 
    p.name as project_name,
    t.title as task_title,
    t.status,
    t.priority
  FROM projects p
  JOIN tasks t ON p.id = t.project_id
  WHERE p.id = ?
  ORDER BY t.priority
`, [project.lastID]);

console.log('Project tasks:', projectTasks);

// Get statistics
const stats = await db.getStats();
console.log('Database stats:', stats);

await db.close();
```

## Error Handling

```javascript
const db = new SQLiteConnector({ path: './app.db' });

try {
  await db.connect();
  
  // This will fail if table doesn't exist
  const data = await db.query('SELECT * FROM non_existent_table');
  
} catch (error) {
  console.error('Database error:', error.message);
  // Handle error appropriately
} finally {
  // Always close connection
  if (db.connected) {
    await db.close();
  }
}
```

## Integration with Express

```javascript
const express = require('express');
const SQLiteConnector = require('@shared-modules/sqlite-connector');

const app = express();
const db = new SQLiteConnector({ path: './api.db' });

// Initialize database
async function initDB() {
  await db.connect();
  await db.createTable('items', {
    id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
    name: 'TEXT NOT NULL',
    price: 'REAL NOT NULL'
  });
}

// API endpoints
app.get('/items', async (req, res) => {
  try {
    const items = await db.query('SELECT * FROM items');
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/items', express.json(), async (req, res) => {
  try {
    const { name, price } = req.body;
    const result = await db.query(
      'INSERT INTO items (name, price) VALUES (?, ?)',
      [name, price]
    );
    res.json({ id: result.lastID, name, price });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Start server
initDB().then(() => {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await db.close();
  process.exit(0);
});
```

## Testing with Jest

```javascript
// user.service.test.js
const SQLiteConnector = require('@shared-modules/sqlite-connector');
const UserService = require('./user.service');

describe('UserService', () => {
  let db;
  let userService;

  beforeAll(async () => {
    // Use in-memory database for tests
    db = new SQLiteConnector({ memory: true });
    await db.connect();
    
    // Setup test schema
    await db.createTable('users', {
      id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
      username: 'TEXT UNIQUE NOT NULL'
    });
    
    userService = new UserService(db);
  });

  afterAll(async () => {
    await db.close();
  });

  beforeEach(async () => {
    // Clear data before each test
    await db.query('DELETE FROM users');
  });

  test('should create user', async () => {
    const user = await userService.create('testuser');
    expect(user.id).toBeDefined();
    expect(user.username).toBe('testuser');
  });

  test('should find user by id', async () => {
    const created = await userService.create('findme');
    const found = await userService.findById(created.id);
    expect(found.username).toBe('findme');
  });
});
```
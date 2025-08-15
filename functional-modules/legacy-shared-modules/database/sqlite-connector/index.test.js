/**
 * SQLite Connector Tests
 * Real tests with real database operations
 */

const SQLiteConnector = require('./index');
const fs = require('fs').promises;
const path = require('path');

describe('SQLiteConnector', () => {
  let db;
  const testDbPath = './test-data/test.db';

  beforeEach(async () => {
    // Clean up test database before each test
    try {
      await fs.unlink(testDbPath);
    } catch (error) {
      // File doesn't exist, that's fine
    }
  });

  afterEach(async () => {
    // Always close connection after tests
    if (db && db.connected) {
      await db.close();
    }
  });

  describe('Connection Management', () => {
    test('should connect to database successfully', async () => {
      db = new SQLiteConnector({ path: testDbPath });
      await db.connect();
      
      expect(db.connected).toBe(true);
      expect(db.dbPath).toBe(testDbPath);
    });

    test('should connect to in-memory database', async () => {
      db = new SQLiteConnector({ memory: true });
      await db.connect();
      
      expect(db.connected).toBe(true);
      expect(db.dbPath).toBe(':memory:');
    });

    test('should throw error when connecting twice', async () => {
      db = new SQLiteConnector({ memory: true });
      await db.connect();
      
      await expect(db.connect()).rejects.toThrow('Database already connected');
    });

    test('should close connection successfully', async () => {
      db = new SQLiteConnector({ memory: true });
      await db.connect();
      await db.close();
      
      expect(db.connected).toBe(false);
      expect(db.db).toBeNull();
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      db = new SQLiteConnector({ memory: true });
      await db.connect();
    });

    test('should create table', async () => {
      const schema = {
        id: 'INTEGER PRIMARY KEY AUTOINCREMENT',
        name: 'TEXT NOT NULL',
        email: 'TEXT UNIQUE',
        created_at: 'DATETIME DEFAULT CURRENT_TIMESTAMP'
      };
      
      await db.createTable('users', schema);
      
      const tables = await db.query(
        "SELECT name FROM sqlite_master WHERE type='table' AND name='users'"
      );
      expect(tables.length).toBe(1);
      expect(tables[0].name).toBe('users');
    });

    test('should insert data', async () => {
      await db.query(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE
        )
      `);
      
      const result = await db.query(
        'INSERT INTO users (name, email) VALUES (?, ?)',
        ['John Doe', 'john@example.com']
      );
      
      expect(result.lastID).toBe(1);
      expect(result.changes).toBe(1);
    });

    test('should select data', async () => {
      await db.query(`
        CREATE TABLE products (
          id INTEGER PRIMARY KEY,
          name TEXT,
          price REAL
        )
      `);
      
      await db.query('INSERT INTO products (name, price) VALUES (?, ?)', ['Laptop', 999.99]);
      await db.query('INSERT INTO products (name, price) VALUES (?, ?)', ['Mouse', 29.99]);
      
      const products = await db.query('SELECT * FROM products ORDER BY price');
      
      expect(products.length).toBe(2);
      expect(products[0].name).toBe('Mouse');
      expect(products[1].name).toBe('Laptop');
    });

    test('should get single row', async () => {
      await db.query('CREATE TABLE config (key TEXT PRIMARY KEY, value TEXT)');
      await db.query('INSERT INTO config VALUES (?, ?)', ['theme', 'dark']);
      await db.query('INSERT INTO config VALUES (?, ?)', ['language', 'en']);
      
      const config = await db.get('SELECT * FROM config WHERE key = ?', ['theme']);
      
      expect(config).not.toBeNull();
      expect(config.key).toBe('theme');
      expect(config.value).toBe('dark');
    });

    test('should update data', async () => {
      await db.query('CREATE TABLE tasks (id INTEGER PRIMARY KEY, status TEXT)');
      await db.query('INSERT INTO tasks (status) VALUES (?)', ['pending']);
      
      const result = await db.query(
        'UPDATE tasks SET status = ? WHERE id = ?',
        ['completed', 1]
      );
      
      expect(result.changes).toBe(1);
      
      const task = await db.get('SELECT * FROM tasks WHERE id = 1');
      expect(task.status).toBe('completed');
    });

    test('should delete data', async () => {
      await db.query('CREATE TABLE logs (id INTEGER PRIMARY KEY, message TEXT)');
      await db.query('INSERT INTO logs (message) VALUES (?)', ['Log 1']);
      await db.query('INSERT INTO logs (message) VALUES (?)', ['Log 2']);
      
      const result = await db.query('DELETE FROM logs WHERE id = ?', [1]);
      
      expect(result.changes).toBe(1);
      
      const logs = await db.query('SELECT * FROM logs');
      expect(logs.length).toBe(1);
    });
  });

  describe('Transactions', () => {
    beforeEach(async () => {
      db = new SQLiteConnector({ memory: true });
      await db.connect();
      await db.query('CREATE TABLE accounts (id INTEGER PRIMARY KEY, balance REAL)');
      await db.query('INSERT INTO accounts VALUES (1, 1000), (2, 500)');
    });

    test('should commit successful transaction', async () => {
      await db.transaction(async (tx) => {
        await tx.query('UPDATE accounts SET balance = balance - 100 WHERE id = 1');
        await tx.query('UPDATE accounts SET balance = balance + 100 WHERE id = 2');
      });
      
      const account1 = await db.get('SELECT * FROM accounts WHERE id = 1');
      const account2 = await db.get('SELECT * FROM accounts WHERE id = 2');
      
      expect(account1.balance).toBe(900);
      expect(account2.balance).toBe(600);
    });

    test('should rollback failed transaction', async () => {
      await expect(
        db.transaction(async (tx) => {
          await tx.query('UPDATE accounts SET balance = balance - 100 WHERE id = 1');
          throw new Error('Transaction failed');
        })
      ).rejects.toThrow('Transaction failed');
      
      const account = await db.get('SELECT * FROM accounts WHERE id = 1');
      expect(account.balance).toBe(1000); // Should remain unchanged
    });
  });

  describe('Statistics', () => {
    test('should get database statistics', async () => {
      db = new SQLiteConnector({ memory: true });
      await db.connect();
      
      await db.query('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
      await db.query('CREATE TABLE posts (id INTEGER PRIMARY KEY, title TEXT)');
      await db.query('INSERT INTO users VALUES (1, "Alice"), (2, "Bob")');
      await db.query('INSERT INTO posts VALUES (1, "Post 1")');
      
      const stats = await db.getStats();
      
      expect(stats.connected).toBe(true);
      expect(stats.tables).toContain('users');
      expect(stats.tables).toContain('posts');
      expect(stats.tableCount).toBe(2);
      expect(stats.users_count).toBe(2);
      expect(stats.posts_count).toBe(1);
    });
  });

  describe('Error Handling', () => {
    test('should throw error for invalid SQL', async () => {
      db = new SQLiteConnector({ memory: true });
      await db.connect();
      
      await expect(
        db.query('INVALID SQL STATEMENT')
      ).rejects.toThrow('Query failed');
    });

    test('should throw error when not connected', async () => {
      db = new SQLiteConnector({ memory: true });
      
      await expect(
        db.query('SELECT 1')
      ).rejects.toThrow('Database not connected');
    });
  });
});
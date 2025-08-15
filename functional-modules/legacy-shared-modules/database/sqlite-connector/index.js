/**
 * SQLite Connector Module
 * Real implementation - No mock data
 * @module sqlite-connector
 */

const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');
const fs = require('fs').promises;

class SQLiteConnector {
  /**
   * Initialize SQLite connection
   * @param {Object} config - Configuration object
   * @param {string} config.path - Database file path
   * @param {boolean} config.memory - Use in-memory database
   * @param {boolean} config.verbose - Enable verbose logging
   * @param {Object} config.options - Additional SQLite options
   */
  constructor(config = {}) {
    this.dbPath = config.memory ? ':memory:' : (config.path || './data.db');
    this.verbose = config.verbose || false;
    this.options = config.options || {};
    this.db = null;
    this.connected = false;
    
    // Enable verbose mode for debugging
    if (this.verbose) {
      sqlite3.verbose();
    }
  }

  /**
   * Connect to database
   * @returns {Promise<void>}
   */
  async connect() {
    if (this.connected) {
      throw new Error('Database already connected');
    }

    // Ensure directory exists for file-based database
    if (this.dbPath !== ':memory:') {
      const dir = path.dirname(this.dbPath);
      await fs.mkdir(dir, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(new Error(`Failed to connect to database: ${err.message}`));
        } else {
          this.connected = true;
          
          // Promisify database methods for async/await support
          this.runAsync = promisify(this.db.run.bind(this.db));
          this.getAsync = promisify(this.db.get.bind(this.db));
          this.allAsync = promisify(this.db.all.bind(this.db));
          
          // Enable foreign keys
          this.db.run('PRAGMA foreign_keys = ON');
          
          if (this.verbose) {
            console.log(`Connected to SQLite database: ${this.dbPath}`);
          }
          
          resolve();
        }
      });
    });
  }

  /**
   * Execute a query with parameters
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<any>}
   */
  async query(sql, params = []) {
    if (!this.connected) {
      throw new Error('Database not connected. Call connect() first.');
    }

    const operation = sql.trim().toUpperCase().split(' ')[0];
    
    try {
      switch (operation) {
        case 'SELECT':
          return await this.allAsync(sql, params);
        
        case 'INSERT':
        case 'UPDATE':
        case 'DELETE':
          const result = await this.runAsync(sql, params);
          return {
            changes: result.changes,
            lastID: result.lastID
          };
        
        default:
          // For DDL statements (CREATE, ALTER, DROP)
          await this.runAsync(sql, params);
          return { success: true };
      }
    } catch (error) {
      throw new Error(`Query failed: ${error.message}\nSQL: ${sql}`);
    }
  }

  /**
   * Get single row
   * @param {string} sql - SQL query
   * @param {Array} params - Query parameters
   * @returns {Promise<Object|null>}
   */
  async get(sql, params = []) {
    if (!this.connected) {
      throw new Error('Database not connected. Call connect() first.');
    }
    
    try {
      return await this.getAsync(sql, params);
    } catch (error) {
      throw new Error(`Get failed: ${error.message}`);
    }
  }

  /**
   * Execute multiple queries in a transaction
   * @param {Function} callback - Transaction callback
   * @returns {Promise<any>}
   */
  async transaction(callback) {
    if (!this.connected) {
      throw new Error('Database not connected. Call connect() first.');
    }

    return new Promise(async (resolve, reject) => {
      this.db.serialize(async () => {
        try {
          await this.runAsync('BEGIN TRANSACTION');
          const result = await callback(this);
          await this.runAsync('COMMIT');
          resolve(result);
        } catch (error) {
          await this.runAsync('ROLLBACK');
          reject(new Error(`Transaction failed: ${error.message}`));
        }
      });
    });
  }

  /**
   * Create table if not exists
   * @param {string} tableName - Table name
   * @param {Object} schema - Table schema
   * @returns {Promise<void>}
   */
  async createTable(tableName, schema) {
    const columns = Object.entries(schema)
      .map(([name, definition]) => `${name} ${definition}`)
      .join(', ');
    
    const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;
    await this.query(sql);
    
    if (this.verbose) {
      console.log(`Table created/verified: ${tableName}`);
    }
  }

  /**
   * Close database connection
   * @returns {Promise<void>}
   */
  async close() {
    if (!this.connected) {
      return;
    }

    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          reject(new Error(`Failed to close database: ${err.message}`));
        } else {
          this.connected = false;
          this.db = null;
          
          if (this.verbose) {
            console.log('Database connection closed');
          }
          
          resolve();
        }
      });
    });
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>}
   */
  async getStats() {
    if (!this.connected) {
      throw new Error('Database not connected');
    }

    const tables = await this.query(
      "SELECT name FROM sqlite_master WHERE type='table'"
    );
    
    const stats = {
      path: this.dbPath,
      connected: this.connected,
      tables: tables.map(t => t.name),
      tableCount: tables.length
    };

    // Get row counts for each table
    for (const table of tables) {
      const count = await this.get(
        `SELECT COUNT(*) as count FROM ${table.name}`
      );
      stats[`${table.name}_count`] = count.count;
    }

    return stats;
  }
}

// Export the class
module.exports = SQLiteConnector;

// Also export as default for ES6 imports
module.exports.default = SQLiteConnector;
import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const postgresDb = process.env.DB_NAME || 'secure_paper_db';
const postgresUser = process.env.DB_USER || 'postgres';
const postgresPass = process.env.DB_PASS || 'postgres';
const postgresHost = process.env.DB_HOST || 'localhost';
const postgresPort = process.env.DB_PORT || 5432;

const dbDialect = process.env.DB_DIALECT || 'sqlite';

let sequelize;

if (dbDialect === 'postgres') {
  sequelize = new Sequelize(postgresDb, postgresUser, postgresPass, {
    host: postgresHost,
    port: postgresPort,
    dialect: 'postgres',
    logging: false
  });
} else {
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path.join(__dirname, '../data/secure_paper.sqlite'),
    logging: false
  });
}

export const connectDB = async () => {
  if (dbDialect === 'postgres') {
    try {
      // Auto-create database 'secure_paper_db' if it doesn't exist
      const client = new pg.Client({
        host: postgresHost,
        port: postgresPort,
        user: postgresUser,
        password: postgresPass,
        database: 'postgres'
      });
      await client.connect();
      const res = await client.query(`SELECT 1 FROM pg_database WHERE datname = '${postgresDb}'`);
      if (res.rowCount === 0) {
        await client.query(`CREATE DATABASE "${postgresDb}"`);
        console.log(`✅ Created PostgreSQL database '${postgresDb}' successfully.`);
      }
      await client.end();

      await sequelize.authenticate();
      console.log(`✅ Connected successfully to POSTGRESQL database.`);
    } catch (error) {
      console.warn('⚠️ Could not connect to PostgreSQL:', error.message);
      console.warn('⚠️ Falling back to SQLite database storage...');
      sequelize = new Sequelize({
        dialect: 'sqlite',
        storage: path.join(__dirname, '../data/secure_paper.sqlite'),
        logging: false
      });
      await sequelize.authenticate();
      console.log('✅ Connected successfully to SQLITE database.');
    }
  } else {
    await sequelize.authenticate();
    console.log('✅ Connected successfully to SQLITE database.');
  }
  return sequelize;
};

export { sequelize };

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config({ override: false });

const postgresDb = process.env.DB_NAME || 'secure_paper_db';
const postgresUser = process.env.DB_USER || 'postgres';
const postgresPass = process.env.DB_PASS || 'postgres';
const postgresHost = process.env.DB_HOST || 'localhost';
const postgresPort = Number(process.env.DB_PORT || 5432);

console.log('🔧 Database configuration:');
console.log('   Host:', postgresHost);
console.log('   User:', postgresUser);
console.log('   Database:', postgresDb);
console.log('   Port:', postgresPort);
console.log('   Dialect:', process.env.DB_DIALECT);

const useSSL = process.env.DB_SSL === 'true';

export const sequelize = new Sequelize(
  postgresDb,
  postgresUser,
  postgresPass,
  {
    host: postgresHost,
    port: postgresPort,
    dialect: 'postgres',
    logging: false,
    dialectOptions: useSSL
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false
          }
        }
      : {}
  }
);

export const connectDB = async () => {
  try {
    await sequelize.authenticate();

    console.log('✅ Connected successfully to POSTGRESQL database.');
    console.log(`📍 Database: ${postgresDb}`);
    console.log(`📍 Host: ${postgresHost}`);
    console.log(`📍 Port: ${postgresPort}`);

    return sequelize;
  } catch (error) {
    console.error('❌ PostgreSQL connection failed.');
    console.error('❌ Error:', error.message);
    throw error;
  }
};
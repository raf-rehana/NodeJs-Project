const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: '1234',
  host: 'localhost',
  port: 5432,
  database: 'postgres',
});

async function createDb() {
  try {
    await client.connect();
    console.log('Connected to PostgreSQL server.');
    const res = await client.query('CREATE DATABASE startupsaas;');
    console.log('Database startupsaas created successfully!');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database already exists.');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }
}

createDb();

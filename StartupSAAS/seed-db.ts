import fs from 'fs';
import path from 'path';
import { sequelize } from './server/src/config/database';
import { modelRegistry } from './server/src/models';

async function seedDatabase() {
  try {
    // Ensure DB is connected and models are registered
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sync all models to make sure they exist
    await sequelize.sync({ force: true });
    
    // Read db.json
    const dbPath = path.join(process.cwd(), 'db.json');
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    // Iterate over keys in db.json and insert into corresponding tables
    for (const [key, records] of Object.entries(data)) {
      if (Array.isArray(records) && records.length > 0) {
        let modelKey = key;
        // Mapping db.json keys to model keys if necessary
        if (key === 'service-requests') modelKey = 'service-requests';
        if (key === 'theme-settings') modelKey = 'theme-settings';
        if (key === 'site-content') modelKey = 'site-content';
        if (key === 'knowledgeBase') modelKey = 'knowledgeBase';
        if (key === 'auditLogs') modelKey = 'auditLogs';

        const Model = modelRegistry[modelKey];
        if (Model) {
          console.log(`Seeding ${records.length} records into ${modelKey}...`);
          // Use bulkCreate, ignoring duplicates if needed
          await Model.bulkCreate(records, { ignoreDuplicates: true });
        } else {
          console.warn(`No model found for key: ${modelKey}`);
        }
      }
    }

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();

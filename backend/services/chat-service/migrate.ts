import * as path from 'path';

export default {
  // ✅ MongoDB connection URI
  uri: 'mongodb://admin:admin_password@localhost:27017/app_db?authSource=admin',

  // ✅ Name of the collection where migrations will be stored
  collection: 'migrations',

  // ✅ Absolute path to the folder where migration files are stored
  // Using `path.resolve` ensures compatibility across environments
  migrationsPath: path.resolve(__dirname, './migrations'),

  // ✅ Path to the migration template file
  templatePath: path.resolve(__dirname, './migrations/template.ts'),

  // ✅ Whether to automatically sync migration metadata
  autosync: false,
};

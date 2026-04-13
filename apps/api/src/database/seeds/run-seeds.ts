import { AppDataSource } from '../data-source';
import { seedUsers } from './seed-users';
import { seedRolesAndPermissions } from './seed-roles-permissions';

async function runSeeds() {
  try {
    console.log('🌱 Starting database seeding...');

    await AppDataSource.initialize();
    console.log('✅ Database connection established');

    await seedRolesAndPermissions();
    await seedUsers();

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

runSeeds();

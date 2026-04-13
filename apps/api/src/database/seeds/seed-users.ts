import { AppDataSource } from '../data-source';
import * as bcrypt from 'bcrypt';

export async function seedUsers() {
  console.log('🌱 Seeding users...');

  const usersRepo = AppDataSource.getRepository('User');
  const rolesRepo = AppDataSource.getRepository('Role');
  const userRoleMappingsRepo = AppDataSource.getRepository('UserRoleMapping');

  // Create admin user
  const adminEmail = 'admin@example.com';
  let adminUser = await usersRepo.findOne({ where: { email: adminEmail } });

  if (!adminUser) {
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    adminUser = await usersRepo.save({
      email: adminEmail,
      hashed_password: hashedPassword,
      full_name: '系統管理員',
      status: 'active',
      email_verified: true,
    });

    console.log(`✅ Created admin user: ${adminEmail}`);
  } else {
    console.log(`✓ Admin user already exists: ${adminEmail}`);
  }

  // Assign super_admin role
  const superAdminRole = await rolesRepo.findOne({
    where: { name: 'super_admin' },
  });

  if (superAdminRole && adminUser) {
    const existing = await userRoleMappingsRepo.findOne({
      where: {
        user_id: adminUser.id,
        role_id: superAdminRole.id,
      },
    });

    if (!existing) {
      await userRoleMappingsRepo.save({
        user_id: adminUser.id,
        role_id: superAdminRole.id,
      });
      console.log(`✅ Assigned super_admin role to admin user`);
    }
  }

  // Create demo survey manager
  const managerEmail = 'manager@example.com';
  let managerUser = await usersRepo.findOne({ where: { email: managerEmail } });

  if (!managerUser) {
    const hashedPassword = await bcrypt.hash('Manager123!', 10);

    managerUser = await usersRepo.save({
      email: managerEmail,
      hashed_password: hashedPassword,
      full_name: '問卷管理員',
      status: 'active',
      email_verified: true,
    });

    console.log(`✅ Created manager user: ${managerEmail}`);
  }

  // Assign survey_manager role
  const surveyManagerRole = await rolesRepo.findOne({
    where: { name: 'survey_manager' },
  });

  if (surveyManagerRole && managerUser) {
    const existing = await userRoleMappingsRepo.findOne({
      where: {
        user_id: managerUser.id,
        role_id: surveyManagerRole.id,
      },
    });

    if (!existing) {
      await userRoleMappingsRepo.save({
        user_id: managerUser.id,
        role_id: surveyManagerRole.id,
      });
      console.log(`✅ Assigned survey_manager role to manager user`);
    }
  }

  // Create demo agent
  const agentEmail = 'agent@example.com';
  let agentUser = await usersRepo.findOne({ where: { email: agentEmail } });

  if (!agentUser) {
    const hashedPassword = await bcrypt.hash('Agent123!', 10);

    agentUser = await usersRepo.save({
      email: agentEmail,
      hashed_password: hashedPassword,
      full_name: '客服人員',
      status: 'active',
      email_verified: true,
    });

    console.log(`✅ Created agent user: ${agentEmail}`);
  }

  // Assign agent role
  const agentRole = await rolesRepo.findOne({ where: { name: 'agent' } });

  if (agentRole && agentUser) {
    const existing = await userRoleMappingsRepo.findOne({
      where: {
        user_id: agentUser.id,
        role_id: agentRole.id,
      },
    });

    if (!existing) {
      await userRoleMappingsRepo.save({
        user_id: agentUser.id,
        role_id: agentRole.id,
      });
      console.log(`✅ Assigned agent role to agent user`);
    }
  }

  console.log('✅ Users seeding completed');
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                     Demo Accounts                        ║
╠══════════════════════════════════════════════════════════╣
║  Admin:   admin@example.com    / Admin123!               ║
║  Manager: manager@example.com  / Manager123!             ║
║  Agent:   agent@example.com    / Agent123!               ║
╚══════════════════════════════════════════════════════════╝
  `);
}

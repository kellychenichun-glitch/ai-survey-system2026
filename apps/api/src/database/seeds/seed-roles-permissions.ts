import { AppDataSource } from '../data-source';

export async function seedRolesAndPermissions() {
  console.log('🌱 Seeding roles and permissions...');

  const rolesRepo = AppDataSource.getRepository('Role');
  const permissionsRepo = AppDataSource.getRepository('Permission');
  const rolePermissionsRepo = AppDataSource.getRepository('RolePermission');

  // Create permissions
  const permissions = [
    // Survey permissions
    { resource: 'survey', action: 'read', display_name: '查看問卷' },
    { resource: 'survey', action: 'create', display_name: '建立問卷' },
    { resource: 'survey', action: 'update', display_name: '編輯問卷' },
    { resource: 'survey', action: 'delete', display_name: '刪除問卷' },
    { resource: 'survey', action: 'publish', display_name: '發布問卷' },

    // Response permissions
    { resource: 'response', action: 'read', display_name: '查看問卷回覆' },
    { resource: 'response', action: 'export', display_name: '匯出問卷回覆' },

    // Analytics permissions
    { resource: 'analytics', action: 'read', display_name: '查看分析結果' },
    { resource: 'analytics', action: 'create', display_name: '執行分析' },
    { resource: 'analytics', action: 'export', display_name: '匯出分析報告' },

    // Knowledge permissions
    { resource: 'knowledge', action: 'read', display_name: '查看知識庫' },
    { resource: 'knowledge', action: 'write', display_name: '編輯知識庫' },

    // Call permissions
    { resource: 'call', action: 'read', display_name: '查看通話紀錄' },
    { resource: 'call', action: 'create', display_name: '發起通話' },

    // Chat permissions
    { resource: 'chat', action: 'read', display_name: '查看聊天紀錄' },
    { resource: 'chat', action: 'handle', display_name: '處理聊天' },

    // Ticket permissions
    { resource: 'ticket', action: 'read', display_name: '查看工單' },
    { resource: 'ticket', action: 'create', display_name: '建立工單' },
    { resource: 'ticket', action: 'update', display_name: '更新工單' },
    { resource: 'ticket', action: 'assign', display_name: '分派工單' },

    // Settings permissions
    { resource: 'settings', action: 'analysis', display_name: '管理分析設定' },
    { resource: 'settings', action: 'voice', display_name: '管理語音設定' },
    { resource: 'settings', action: 'system', display_name: '管理系統設定' },

    // User permissions
    { resource: 'user', action: 'read', display_name: '查看使用者' },
    { resource: 'user', action: 'write', display_name: '管理使用者' },

    // Role permissions
    { resource: 'role', action: 'read', display_name: '查看角色' },
    { resource: 'role', action: 'write', display_name: '管理角色' },
  ];

  const createdPermissions = [];
  for (const permission of permissions) {
    const existing = await permissionsRepo.findOne({
      where: { resource: permission.resource, action: permission.action },
    });

    if (!existing) {
      const perm = await permissionsRepo.save({
        ...permission,
        is_system: true,
      });
      createdPermissions.push(perm);
    } else {
      createdPermissions.push(existing);
    }
  }

  console.log(`✅ Created ${createdPermissions.length} permissions`);

  // Create roles
  const roles = [
    {
      name: 'super_admin',
      display_name: '超級管理員',
      description: '擁有所有權限',
      level: 100,
      is_system: true,
    },
    {
      name: 'survey_manager',
      display_name: '問卷管理員',
      description: '管理問卷與分析',
      level: 50,
      is_system: true,
    },
    {
      name: 'agent',
      display_name: '客服人員',
      description: '處理客服與工單',
      level: 10,
      is_system: true,
    },
    {
      name: 'viewer',
      display_name: '檢視者',
      description: '僅能查看資料',
      level: 5,
      is_system: true,
    },
  ];

  const createdRoles = [];
  for (const role of roles) {
    const existing = await rolesRepo.findOne({ where: { name: role.name } });

    if (!existing) {
      const r = await rolesRepo.save(role);
      createdRoles.push(r);
    } else {
      createdRoles.push(existing);
    }
  }

  console.log(`✅ Created ${createdRoles.length} roles`);

  // Assign all permissions to super_admin
  const superAdminRole = createdRoles.find((r) => r.name === 'super_admin');
  if (superAdminRole) {
    for (const permission of createdPermissions) {
      const existing = await rolePermissionsRepo.findOne({
        where: {
          role_id: superAdminRole.id,
          permission_id: permission.id,
        },
      });

      if (!existing) {
        await rolePermissionsRepo.save({
          role_id: superAdminRole.id,
          permission_id: permission.id,
        });
      }
    }
    console.log(`✅ Assigned all permissions to super_admin role`);
  }

  // Assign survey permissions to survey_manager
  const surveyManagerRole = createdRoles.find((r) => r.name === 'survey_manager');
  if (surveyManagerRole) {
    const surveyPermissions = createdPermissions.filter(
      (p) =>
        p.resource === 'survey' ||
        p.resource === 'response' ||
        p.resource === 'analytics' ||
        p.resource === 'knowledge',
    );

    for (const permission of surveyPermissions) {
      const existing = await rolePermissionsRepo.findOne({
        where: {
          role_id: surveyManagerRole.id,
          permission_id: permission.id,
        },
      });

      if (!existing) {
        await rolePermissionsRepo.save({
          role_id: surveyManagerRole.id,
          permission_id: permission.id,
        });
      }
    }
    console.log(`✅ Assigned survey permissions to survey_manager role`);
  }

  // Assign chat/call/ticket permissions to agent
  const agentRole = createdRoles.find((r) => r.name === 'agent');
  if (agentRole) {
    const agentPermissions = createdPermissions.filter(
      (p) =>
        p.resource === 'call' ||
        p.resource === 'chat' ||
        p.resource === 'ticket' ||
        p.resource === 'knowledge',
    );

    for (const permission of agentPermissions) {
      const existing = await rolePermissionsRepo.findOne({
        where: {
          role_id: agentRole.id,
          permission_id: permission.id,
        },
      });

      if (!existing) {
        await rolePermissionsRepo.save({
          role_id: agentRole.id,
          permission_id: permission.id,
        });
      }
    }
    console.log(`✅ Assigned agent permissions to agent role`);
  }

  console.log('✅ Roles and permissions seeding completed');
}

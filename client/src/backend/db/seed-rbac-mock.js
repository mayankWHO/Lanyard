import dotenv from 'dotenv';
import { supabase } from '../config/supabase.js';
import { PROJECT_ROLES } from '../utils/rbac.js';

dotenv.config();

async function seedMockRoles() {
  const projectId = process.env.MOCK_PROJECT_ID;
  const ownerUserId = process.env.MOCK_OWNER_USER_ID;
  const adminUserId = process.env.MOCK_ADMIN_USER_ID;
  const memberUserId = process.env.MOCK_MEMBER_USER_ID;
  const viewerUserId = process.env.MOCK_VIEWER_USER_ID;

  if (!projectId || !ownerUserId || !adminUserId || !memberUserId || !viewerUserId) {
    throw new Error(
      'Missing mock seed env vars. Required: MOCK_PROJECT_ID, MOCK_OWNER_USER_ID, MOCK_ADMIN_USER_ID, MOCK_MEMBER_USER_ID, MOCK_VIEWER_USER_ID',
    );
  }

  const rows = [
    { project_id: projectId, user_id: ownerUserId, role: PROJECT_ROLES.OWNER, added_by: ownerUserId },
    { project_id: projectId, user_id: adminUserId, role: PROJECT_ROLES.ADMIN, added_by: ownerUserId },
    { project_id: projectId, user_id: memberUserId, role: PROJECT_ROLES.MEMBER, added_by: ownerUserId },
    { project_id: projectId, user_id: viewerUserId, role: PROJECT_ROLES.VIEWER, added_by: ownerUserId },
  ];

  const { error } = await supabase
    .from('project_members')
    .upsert(rows, { onConflict: 'project_id,user_id' });

  if (error) {
    throw error;
  }

  console.log('Mock RBAC memberships seeded successfully.');
}

seedMockRoles().catch((error) => {
  console.error('Failed to seed mock RBAC memberships:', error);
  process.exit(1);
});

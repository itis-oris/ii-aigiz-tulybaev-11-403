export const ORG_ADMIN_ROLE = 'OWNER';
export const PROJECT_OWNER_ROLE = 'OWNER';
export const PROJECT_MEMBER_ROLE = 'MEMBER';

export const hasOrgAdminRole = (roles: string[] | null | undefined) =>
    Boolean(roles?.includes(ORG_ADMIN_ROLE));

export const hasProjectOwnerRole = (roles: string[] | null | undefined) =>
    Boolean(roles?.includes(PROJECT_OWNER_ROLE));

export const hasProjectMemberRole = (roles: string[] | null | undefined) =>
    Boolean(
        roles?.includes(PROJECT_MEMBER_ROLE) ||
        roles?.includes(PROJECT_OWNER_ROLE),
    );

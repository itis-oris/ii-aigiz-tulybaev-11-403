import type { ProjectStatus, UserResponse } from '@/shared/api';
import {
    ORG_ADMIN_ROLE,
    PROJECT_OWNER_ROLE,
    PROJECT_MEMBER_ROLE,
} from '@/shared/lib';

export type ProjectParticipant = {
    id: string;
    name: string;
    role: string;
    roleCode: string;
    initials: string;
    accentClassName: string;
    avatarUrl?: string | null;
    isOwner?: boolean;
};

export type WorkspaceMember = ProjectParticipant & {
    email: string;
};

const memberAccentPalette = [
    'bg-violet-500/12 text-violet-700 ring-1 ring-violet-500/20',
    'bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20',
    'bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/20',
    'bg-lime-500/12 text-lime-700 ring-1 ring-lime-500/20',
    'bg-rose-500/12 text-rose-700 ring-1 ring-rose-500/20',
    'bg-cyan-500/12 text-cyan-700 ring-1 ring-cyan-500/20',
    'bg-indigo-500/12 text-indigo-700 ring-1 ring-indigo-500/20',
    'bg-fuchsia-500/12 text-fuchsia-700 ring-1 ring-fuchsia-500/20',
] as const;

const projectStatusToneMap: Record<ProjectStatus, string> = {
    PLANNING: 'bg-amber-500/12 text-amber-700 ring-1 ring-amber-500/20',
    ACTIVE: 'bg-emerald-500/12 text-emerald-700 ring-1 ring-emerald-500/20',
    ON_HOLD: 'bg-slate-500/12 text-slate-700 ring-1 ring-slate-500/20',
    COMPLETED: 'bg-sky-500/12 text-sky-700 ring-1 ring-sky-500/20',
};

const projectStatusLabelMap: Record<ProjectStatus, string> = {
    PLANNING: 'Планирование',
    ACTIVE: 'В работе',
    ON_HOLD: 'На паузе',
    COMPLETED: 'Завершен',
};

const rolePriority = [
    ORG_ADMIN_ROLE,
    PROJECT_OWNER_ROLE,
    PROJECT_MEMBER_ROLE,
] as const;

export const getParticipantAccentClassName = (index: number) =>
    memberAccentPalette[index % memberAccentPalette.length];

export const getParticipantInitials = (value: string) =>
    value
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('')
        .slice(0, 2) || 'U';

export const getUserDisplayName = (user: {
    firstname?: string | null;
    lastname?: string | null;
    email: string;
}) => {
    const fullName = [user.firstname, user.lastname]
        .filter(Boolean)
        .join(' ')
        .trim();

    return fullName || user.email;
};

export const getProjectStatusLabel = (status: ProjectStatus) =>
    projectStatusLabelMap[status];

export const getProjectStatusToneClassName = (status: ProjectStatus) =>
    projectStatusToneMap[status];

export const getUserRoleLabel = (roles: string[]) => {
    const primaryRole =
        rolePriority.find((role) => roles.includes(role)) ??
        roles[0] ??
        PROJECT_MEMBER_ROLE;

    switch (primaryRole) {
        case ORG_ADMIN_ROLE:
            return 'Администратор';
        case PROJECT_OWNER_ROLE:
            return 'Владелец проекта';
        default:
            return 'Участник';
    }
};

export const mapUserToWorkspaceMember = (
    user: UserResponse,
    index: number,
): WorkspaceMember => {
    const name = getUserDisplayName(user);

    return {
        id: user.id,
        name,
        role: getUserRoleLabel(user.roles),
        roleCode:
            rolePriority.find((role) => user.roles.includes(role)) ??
            PROJECT_MEMBER_ROLE,
        initials: getParticipantInitials(name),
        accentClassName: getParticipantAccentClassName(index),
        email: user.email,
        avatarUrl: user.avatarUrl,
    };
};

export const projectOverview = {
    name: 'Sprintly Web',
    status: 'В работе',
    statusToneClassName: getProjectStatusToneClassName('ACTIVE'),
    description: 'Основной проект интерфейса и рабочего пространства.',
    emoji: 'SW',
    members: [
        {
            id: 'member-1',
            name: 'Alex Johnson',
            role: 'Владелец проекта',
            roleCode: PROJECT_OWNER_ROLE,
            initials: 'AJ',
            accentClassName: getParticipantAccentClassName(0),
            isOwner: true,
        },
        {
            id: 'member-2',
            name: 'Mia Harper',
            role: 'Участник',
            roleCode: PROJECT_MEMBER_ROLE,
            initials: 'MH',
            accentClassName: getParticipantAccentClassName(1),
            isOwner: false,
        },
    ],
};

export const workspaceMembers: WorkspaceMember[] = projectOverview.members.map(
    (member, index) => ({
        ...member,
        email: `member${index + 1}@sprintly.app`,
    }),
);

export const SIDEBAR_ROOT_DROP_ID = 'sidebar-folder:root';

export const getSidebarFolderDropId = (folderId: string) =>
    `sidebar-folder:${folderId}`;

export const getSidebarProjectDragId = (projectId: string) =>
    `sidebar-project:${projectId}`;

export const parseSidebarProjectId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('sidebar-project:')) {
        return null;
    }

    return value.slice('sidebar-project:'.length);
};

export const parseSidebarFolderId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('sidebar-folder:')) {
        return undefined;
    }

    const folderId = value.slice('sidebar-folder:'.length);

    return folderId === 'root' ? undefined : folderId;
};

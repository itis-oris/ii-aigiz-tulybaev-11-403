export const ALL_PROJECTS_ROOT_DROP_ID = 'folder:root';

export const getAllProjectsFolderDropId = (folderId: string) =>
    `folder:${folderId}`;

export const getAllProjectsProjectDragId = (projectId: string) =>
    `project:${projectId}`;

export const parseAllProjectsProjectId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('project:')) {
        return null;
    }

    return value.slice('project:'.length);
};

export const parseAllProjectsFolderId = (
    value: string | number | symbol | null | undefined,
) => {
    if (typeof value !== 'string' || !value.startsWith('folder:')) {
        return undefined;
    }

    const folderId = value.slice('folder:'.length);

    return folderId === 'root' ? undefined : folderId;
};

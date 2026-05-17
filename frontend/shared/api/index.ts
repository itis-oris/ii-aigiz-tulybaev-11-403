export { getCurrentUser, login, register } from './auth';
export {
    createOrganization,
    deleteOrganization,
    getOrganizations,
    switchOrganization,
    updateOrganization,
} from './organization';
export {
    createProject,
    deleteProject,
    getProjects,
    uploadProjectImage,
    updateProject,
} from './project';
export {
    createProjectFolder,
    deleteProjectFolder,
    getProjectFolders,
    updateProjectFolder,
} from './project-folder';
export { getUsers } from './user';
export type {
    AuthResponse,
    CurrentUserResponse,
    LoginRequest,
    RegisterRequest,
} from './auth';
export type {
    CreateOrganizationRequest,
    OrganizationResponse,
    OrganizationSessionResponse,
    UpdateOrganizationRequest,
} from './organization';
export type {
    CreateProjectRequest,
    ProjectResponse,
    ProjectStatus,
    UpdateProjectRequest,
} from './project';
export type {
    CreateProjectFolderRequest,
    ProjectFolderResponse,
    UpdateProjectFolderRequest,
} from './project-folder';
export type { UserResponse } from './user';
export { apiClient, ApiError } from './client';

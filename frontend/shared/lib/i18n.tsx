'use client';

import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    useSyncExternalStore,
    type PropsWithChildren,
} from 'react';

const LOCALE_STORAGE_KEY = 'sprintly-locale';

type DictionaryValue = string | Dictionary;
type Dictionary = {
    [key: string]: DictionaryValue;
};

type Locale = 'ru' | 'en';

type I18nContextValue = {
    locale: Locale;
    mounted: boolean;
    setLocale: (locale: Locale) => void;
    toggleLocale: () => void;
    t: (key: string, params?: Record<string, string | number>) => string;
};

const dictionaries: Record<Locale, Dictionary> = {
    ru: {
        common: {
            cancel: 'Отмена',
            saveChanges: 'Сохранить изменения',
            closeDialog: 'Закрыть диалог',
            light: 'Светлая',
            dark: 'Тёмная',
        },
        auth: {
            loginTitle: 'Вход в Sprintly',
            loginDescription: 'Войдите, чтобы продолжить работу с задачами.',
            loginFooterText: 'Нет аккаунта?',
            loginFooterLink: 'Зарегистрироваться',
            loginError: 'Проверьте данные формы.',
            loginSubmit: 'Войти',
            registerTitle: 'Создание аккаунта',
            registerDescription: 'Заполните форму, чтобы начать работу.',
            registerFooterText: 'Уже есть аккаунт?',
            registerFooterLink: 'Войти',
            registerError: 'Проверьте данные формы.',
            registerSubmit: 'Зарегистрироваться',
            clear: 'Очистить',
        },
        sidebar: {
            settings: 'Настройки',
            theme: 'Тема',
            language: 'Язык',
            logout: 'Выйти',
            openProfileMenu: 'Открыть меню профиля',
            closeProfileMenu: 'Закрыть меню профиля',
            superAdmin: 'Суперадмин',
            myTasks: 'Мои задачи',
            allTasks: 'Все задачи',
            allProjects: 'Все проекты',
            searchProjects: 'Поиск проектов',
            projects: 'Проекты',
            addFolder: 'Добавить папку',
            addProject: 'Добавить проект',
            dragProjectHint: 'Перетащите проект в папку',
            invite: 'Пригласить',
            profile: 'Профиль',
        },
        dialogs: {
            createFolderTitle: 'Новая папка',
            createFolderDescription: 'Сгруппируйте проекты по направлениям.',
            folderName: 'Название папки',
            folderNamePlaceholder: 'Например, Маркетинг',
            createFolder: 'Создать папку',
            inviteWorkspaceTitle: 'Пригласить в рабочее пространство',
            inviteWorkspaceDescription:
                'Добавьте участников по ссылке или email.',
            inviteLink: 'Ссылка-приглашение',
            toggleInviteLink: 'Сгенерировать ссылку',
            linkPending: 'Ссылка появится после генерации',
            copy: 'Копировать',
            emailPlaceholder: 'name@example.com',
            removeInviteRow: 'Удалить строку',
            addMore: 'Добавить ещё',
            invitePeople: 'Пригласить',
            createProjectTitle: 'Новый проект',
            createProjectDescription:
                'Создайте проект внутри рабочего пространства.',
            newProject: 'Новый проект',
            projectPreview: 'Предпросмотр',
            projectName: 'Название проекта',
            projectNamePlaceholder: 'Например, Sprintly Web',
            projectDescription: 'Описание',
            folder: 'Папка',
            noFolder: 'Без папки',
            newWorkspaceProject: 'Новый проект рабочей области',
            createProject: 'Создать проект',
        },
        overview: {
            members: 'Участники',
            membersDescription: 'Команда проекта и роли.',
            addMember: 'Добавить участника',
            addMemberTitle: 'Добавить участника',
            addMemberDescription:
                'Найдите пользователя и добавьте его в проект.',
            searchMembers: 'Поиск участника',
            noMembers: 'Ничего не найдено',
            addMembers: 'Добавить',
        },
        profile: {
            title: 'Профиль',
            description: 'Управление персональными данными и ролью.',
            general: 'Основное',
            generalDescription: 'Базовая информация пользователя.',
            firstName: 'Имя',
            role: 'Роль',
        },
        organization: {
            openMenu: 'Открыть меню организации',
            createTitle: 'Новая организация',
            createDescription:
                'Создайте еще одно рабочее пространство и сразу переключитесь в него.',
            editTitle: 'Настройки организации',
            editDescription: 'Измените название текущей организации.',
            nameLabel: 'Название организации',
            namePlaceholder: 'Например, Sprintly Team',
            createAction: 'Создать организацию',
            saveAction: 'Сохранить',
            deleteAction: 'Удалить организацию',
            createError: 'Не удалось создать организацию',
            switchError: 'Не удалось переключить организацию',
            updateError: 'Не удалось обновить организацию',
            deleteError: 'Не удалось удалить организацию',
            count: '{count} орг.',
        },
        landing: {
            eyebrow: 'Планирование задач и проектов',
            description:
                'Sprintly помогает команде держать проекты, дедлайны и исполнителей в одном рабочем контуре.',
            register: 'Регистрация',
            login: 'Войти',
            imageAlt: 'Интерфейс Sprintly',
        },
    },
    en: {
        common: {
            cancel: 'Cancel',
            saveChanges: 'Save changes',
            closeDialog: 'Close dialog',
            light: 'Light',
            dark: 'Dark',
        },
        auth: {
            loginTitle: 'Sign in to Sprintly',
            loginDescription: 'Sign in to continue working with tasks.',
            loginFooterText: "Don't have an account?",
            loginFooterLink: 'Register',
            loginError: 'Check the form fields.',
            loginSubmit: 'Sign in',
            registerTitle: 'Create account',
            registerDescription: 'Fill out the form to get started.',
            registerFooterText: 'Already have an account?',
            registerFooterLink: 'Sign in',
            registerError: 'Check the form fields.',
            registerSubmit: 'Register',
            clear: 'Clear',
        },
        sidebar: {
            settings: 'Settings',
            theme: 'Theme',
            language: 'Language',
            logout: 'Log out',
            openProfileMenu: 'Open profile menu',
            closeProfileMenu: 'Close profile menu',
            superAdmin: 'Super admin',
            myTasks: 'My tasks',
            allTasks: 'All tasks',
            allProjects: 'All projects',
            searchProjects: 'Search projects',
            projects: 'Projects',
            addFolder: 'Add folder',
            addProject: 'Add project',
            dragProjectHint: 'Drag a project into a folder',
            invite: 'Invite',
            profile: 'Profile',
        },
        dialogs: {
            createFolderTitle: 'New folder',
            createFolderDescription: 'Group projects by direction.',
            folderName: 'Folder name',
            folderNamePlaceholder: 'For example, Marketing',
            createFolder: 'Create folder',
            inviteWorkspaceTitle: 'Invite to workspace',
            inviteWorkspaceDescription: 'Add people by invite link or email.',
            inviteLink: 'Invite link',
            toggleInviteLink: 'Generate link',
            linkPending: 'Link will appear after generation',
            copy: 'Copy',
            emailPlaceholder: 'name@example.com',
            removeInviteRow: 'Remove row',
            addMore: 'Add more',
            invitePeople: 'Invite people',
            createProjectTitle: 'New project',
            createProjectDescription: 'Create a project inside the workspace.',
            newProject: 'New project',
            projectPreview: 'Preview',
            projectName: 'Project name',
            projectNamePlaceholder: 'For example, Sprintly Web',
            projectDescription: 'Description',
            folder: 'Folder',
            noFolder: 'No folder',
            newWorkspaceProject: 'New workspace project',
            createProject: 'Create project',
        },
        overview: {
            members: 'Members',
            membersDescription: 'Project team and roles.',
            addMember: 'Add member',
            addMemberTitle: 'Add member',
            addMemberDescription: 'Find a user and add them to the project.',
            searchMembers: 'Search members',
            noMembers: 'Nothing found',
            addMembers: 'Add',
        },
        profile: {
            title: 'Profile',
            description: 'Manage personal details and role.',
            general: 'General',
            generalDescription: 'Basic user information.',
            firstName: 'First name',
            role: 'Role',
        },
        organization: {
            openMenu: 'Open organization menu',
            createTitle: 'New organization',
            createDescription:
                'Create another workspace and switch to it right away.',
            editTitle: 'Organization settings',
            editDescription: 'Update the current organization name.',
            nameLabel: 'Organization name',
            namePlaceholder: 'For example, Sprintly Team',
            createAction: 'Create organization',
            saveAction: 'Save',
            deleteAction: 'Delete organization',
            createError: 'Failed to create organization',
            switchError: 'Failed to switch organization',
            updateError: 'Failed to update organization',
            deleteError: 'Failed to delete organization',
            count: '{count} orgs',
        },
        landing: {
            eyebrow: 'Task and project planning',
            description:
                'Sprintly keeps projects, deadlines, and assignees in one working surface.',
            register: 'Register',
            login: 'Sign in',
            imageAlt: 'Sprintly interface',
        },
    },
};

const I18nContext = createContext<I18nContextValue | null>(null);

const subscribe = () => () => {};
const getClientMountedSnapshot = () => true;
const getServerMountedSnapshot = () => false;

const getClientLocaleSnapshot = (): Locale => {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY);

    return storedLocale === 'en' || storedLocale === 'ru' ? storedLocale : 'ru';
};

const getServerLocaleSnapshot = (): Locale => 'ru';

const getResolvedValue = (
    dictionary: Dictionary,
    key: string,
): string | undefined => {
    const parts = key.split('.');
    let current: DictionaryValue | undefined = dictionary;

    for (const part of parts) {
        if (
            current === undefined ||
            typeof current === 'string' ||
            !(part in current)
        ) {
            return undefined;
        }

        current = current[part];
    }

    return typeof current === 'string' ? current : undefined;
};

const formatMessage = (
    template: string,
    params?: Record<string, string | number>,
): string => {
    if (!params) {
        return template;
    }

    return template.replace(/\{(\w+)\}/g, (_, key: string) => {
        const value = params[key];
        return value === undefined ? `{${key}}` : String(value);
    });
};

export function LocaleProvider({ children }: PropsWithChildren) {
    const storedLocale = useSyncExternalStore(
        subscribe,
        getClientLocaleSnapshot,
        getServerLocaleSnapshot,
    );
    const mounted = useSyncExternalStore(
        subscribe,
        getClientMountedSnapshot,
        getServerMountedSnapshot,
    );
    const [localeOverride, setLocaleOverride] = useState<Locale | null>(null);
    const locale = localeOverride ?? storedLocale;

    const setLocale = useCallback((nextLocale: Locale) => {
        window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        document.documentElement.lang = nextLocale;
        setLocaleOverride(nextLocale);
    }, []);

    const toggleLocale = useCallback(() => {
        const nextLocale = locale === 'ru' ? 'en' : 'ru';

        window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale);
        document.documentElement.lang = nextLocale;
        setLocaleOverride(nextLocale);
    }, [locale]);

    const t = useCallback(
        (key: string, params?: Record<string, string | number>) =>
            formatMessage(
                getResolvedValue(dictionaries[locale], key) ??
                    getResolvedValue(dictionaries.ru, key) ??
                    key,
                params,
            ),
        [locale],
    );

    const value = useMemo(
        () => ({
            locale,
            mounted,
            setLocale,
            toggleLocale,
            t,
        }),
        [locale, mounted, setLocale, t, toggleLocale],
    );

    return (
        <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
    );
}

export function useI18n() {
    const context = useContext(I18nContext);

    if (!context) {
        throw new Error('useI18n must be used within a LocaleProvider.');
    }

    return context;
}

export { LOCALE_STORAGE_KEY };
export type { Locale };

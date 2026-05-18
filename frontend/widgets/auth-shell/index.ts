import { AuthCard } from './ui/auth-card';
import { AuthField } from './ui/auth-field';
import { AuthFormError } from './ui/auth-form-error';
import { AuthFormFooter } from './ui/auth-form-footer';
import { GuestGuard } from './ui/guest-guard';
import { OrganizationSetupGuard } from './ui/organization-setup-guard';
import { AuthPageShell } from './ui/auth-page-shell';
import { ProtectedGuard } from './ui/protected-guard';

export {
    AuthCard,
    AuthField,
    AuthFormError,
    AuthFormFooter,
    AuthPageShell,
    GuestGuard,
    OrganizationSetupGuard,
    ProtectedGuard,
};
export type { AuthFieldConfig, FieldErrors } from './lib/auth-form';
export {
    validateEmail,
    validatePassword,
    validateRequired,
} from './lib/auth-validation';

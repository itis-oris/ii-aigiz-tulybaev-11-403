import { AuthCard } from '@/widgets/auth-shell/ui/auth-card';
import { AuthField } from '@/widgets/auth-shell/ui/auth-field';
import { AuthFormError } from '@/widgets/auth-shell/ui/auth-form-error';
import { AuthFormFooter } from '@/widgets/auth-shell/ui/auth-form-footer';
import { AuthPageShell } from '@/widgets/auth-shell/ui/auth-page-shell';

export { AuthCard, AuthField, AuthFormError, AuthFormFooter, AuthPageShell };
export type {
    AuthFieldConfig,
    FieldErrors,
} from '@/widgets/auth-shell/lib/auth-form';
export {
    validateEmail,
    validatePassword,
    validateRequired,
} from '@/widgets/auth-shell/lib/auth-validation';

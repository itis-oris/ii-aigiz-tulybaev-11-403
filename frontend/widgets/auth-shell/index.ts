import { AuthCard } from './ui/auth-card';
import { AuthField } from './ui/auth-field';
import { AuthFormError } from './ui/auth-form-error';
import { AuthFormFooter } from './ui/auth-form-footer';
import { AuthPageShell } from './ui/auth-page-shell';

export { AuthCard, AuthField, AuthFormError, AuthFormFooter, AuthPageShell };
export type { AuthFieldConfig, FieldErrors } from './lib/auth-form';
export {
    validateEmail,
    validatePassword,
    validateRequired,
} from './lib/auth-validation';

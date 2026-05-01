import { LoginForm } from '@/app/login/_ui/login-form';
import { AuthPageShell } from '@/widgets/auth-shell';

export default function LoginPage() {
    return (
        <AuthPageShell>
            <LoginForm />
        </AuthPageShell>
    );
}

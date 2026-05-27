import { LoginForm } from '@/app/login/_ui/login-form';
import { AuthPageShell, GuestGuard } from '@/widgets/auth-shell';

export default function LoginPage() {
    return (
        <GuestGuard>
            <AuthPageShell>
                <LoginForm />
            </AuthPageShell>
        </GuestGuard>
    );
}

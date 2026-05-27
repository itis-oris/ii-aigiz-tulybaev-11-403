import { RegisterForm } from '@/app/register/_ui/register-form';
import { AuthPageShell, GuestGuard } from '@/widgets/auth-shell';

export default function RegisterPage() {
    return (
        <GuestGuard>
            <AuthPageShell>
                <RegisterForm />
            </AuthPageShell>
        </GuestGuard>
    );
}

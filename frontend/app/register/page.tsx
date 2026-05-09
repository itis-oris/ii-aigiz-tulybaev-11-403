import { RegisterForm } from '@/app/register/_ui/register-form';
import { AuthPageShell } from '@/widgets/auth-shell';

export default function RegisterPage() {
    return (
        <AuthPageShell>
            <RegisterForm />
        </AuthPageShell>
    );
}

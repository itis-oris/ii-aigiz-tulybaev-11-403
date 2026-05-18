import { InvitationPage } from '@/views/invitation';

type InvitationPageRouteProps = {
    params: Promise<{
        token: string;
    }>;
};

export default async function InviteTokenPage({
    params,
}: InvitationPageRouteProps) {
    const { token } = await params;

    return <InvitationPage token={token} />;
}

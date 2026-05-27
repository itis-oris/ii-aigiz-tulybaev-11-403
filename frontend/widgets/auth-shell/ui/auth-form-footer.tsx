import Link from 'next/link';

type AuthFormFooterProps = {
    href: string;
    linkLabel: string;
    text: string;
};

export const AuthFormFooter = ({
    href,
    linkLabel,
    text,
}: AuthFormFooterProps) => {
    return (
        <div className="text-sm leading-6 text-muted-foreground">
            {text}{' '}
            <Link
                href={href}
                className="font-medium text-foreground underline underline-offset-4 transition-colors hover:text-primary"
            >
                {linkLabel}
            </Link>
            .
        </div>
    );
};

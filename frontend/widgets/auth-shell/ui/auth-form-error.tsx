import { CircleAlert } from 'lucide-react';

type AuthFormErrorProps = {
    message: string;
};

export const AuthFormError = ({ message }: AuthFormErrorProps) => {
    return (
        <div className="flex items-start gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-3 text-sm text-destructive">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <span>{message}</span>
        </div>
    );
};

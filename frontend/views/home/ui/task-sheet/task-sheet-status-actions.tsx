import { LoaderCircle } from 'lucide-react';
import { Button } from '@/shared/ui';
import type { TaskStatus } from '@/shared/api';

export const TaskSheetStatusActions = ({
    resolvedApiStatus,
    isUpdatingStatus,
    statusUpdateTarget,
    onUpdateStatus,
}: {
    resolvedApiStatus: TaskStatus;
    isUpdatingStatus: boolean;
    statusUpdateTarget?: TaskStatus;
    onUpdateStatus: (status: TaskStatus) => void;
}) => (
    <div className="flex flex-wrap gap-3">
        <Button
            type="button"
            disabled={isUpdatingStatus || resolvedApiStatus === 'DONE'}
            onClick={() => onUpdateStatus('DONE')}
        >
            {isUpdatingStatus && statusUpdateTarget === 'DONE' ? (
                <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            Выполнить
        </Button>
        <Button
            type="button"
            variant="outline"
            disabled={isUpdatingStatus || resolvedApiStatus === 'IN_PROGRESS'}
            onClick={() => onUpdateStatus('IN_PROGRESS')}
        >
            {isUpdatingStatus && statusUpdateTarget === 'IN_PROGRESS' ? (
                <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            Старт
        </Button>
        <Button
            type="button"
            variant="ghost"
            disabled={isUpdatingStatus || resolvedApiStatus === 'TODO'}
            onClick={() => onUpdateStatus('TODO')}
        >
            {isUpdatingStatus && statusUpdateTarget === 'TODO' ? (
                <LoaderCircle className="size-4 animate-spin" />
            ) : null}
            В backlog
        </Button>
    </div>
);

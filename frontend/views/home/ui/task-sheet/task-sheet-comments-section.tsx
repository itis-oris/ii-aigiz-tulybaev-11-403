import { LoaderCircle, SendHorizontal } from 'lucide-react';
import { Avatar, Button } from '@/shared/ui';
import { Input } from '@/shared/ui/input';
import type { TaskSheetCommentItem } from './task-sheet.types';
import { formatCommentTime, getInitials } from './task-sheet.lib';
import { TaskSheetErrorNotice } from './task-sheet-error-notice';

export const TaskSheetCommentsSection = ({
    comments,
    isCommentsRefreshing,
    commentsError,
    commentDraft,
    onCommentDraftChange,
    isCommentSubmitDisabled,
    isCreatingComment,
    onSubmitComment,
    currentUserId,
}: {
    comments: TaskSheetCommentItem[];
    isCommentsRefreshing: boolean;
    commentsError: Error | null;
    commentDraft: string;
    onCommentDraftChange: (value: string) => void;
    isCommentSubmitDisabled: boolean;
    isCreatingComment: boolean;
    onSubmitComment: () => void;
    currentUserId?: string;
}) => (
    <div className="border-t border-border pt-6">
        <div className="mb-4 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            <span>Комментарии</span>
            {isCommentsRefreshing ? (
                <LoaderCircle className="size-3.5 animate-spin" />
            ) : null}
        </div>

        {commentsError ? (
            <div className="mb-4">
                <TaskSheetErrorNotice>
                    Не удалось загрузить комментарии: {commentsError.message}
                </TaskSheetErrorNotice>
            </div>
        ) : null}

        <div className="mb-4 space-y-4">
            {comments.length ? (
                comments.map((comment) => {
                    const isOwn = comment.userId === currentUserId;
                    const author =
                        comment.userEmail || 'Неизвестный пользователь';

                    return (
                        <div
                            key={comment.id}
                            className={`flex gap-3 ${isOwn ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isOwn && (
                                <Avatar
                                    size="lg"
                                    className="bg-sidebar text-sidebar-foreground"
                                >
                                    {getInitials(author)}
                                </Avatar>
                            )}
                            <div
                                className={`max-w-[80%] rounded-2xl border p-4 ${
                                    isOwn
                                        ? 'border-accent bg-accent text-accent-foreground'
                                        : 'border-border bg-card text-foreground'
                                }`}
                            >
                                <div className="mb-1 flex items-center gap-2">
                                    <span
                                        className={`text-sm font-medium ${
                                            isOwn
                                                ? 'text-accent-foreground'
                                                : 'text-foreground'
                                        }`}
                                    >
                                        {author}
                                    </span>
                                    <span
                                        className={`text-xs ${
                                            isOwn
                                                ? 'text-accent-foreground/70'
                                                : 'text-muted-foreground'
                                        }`}
                                    >
                                        {formatCommentTime(comment.createdAt)}
                                    </span>
                                </div>
                                <p
                                    className={`text-sm leading-6 ${
                                        isOwn
                                            ? 'text-accent-foreground'
                                            : 'text-foreground'
                                    }`}
                                >
                                    {comment.text}
                                </p>
                            </div>
                            {isOwn && (
                                <Avatar
                                    size="lg"
                                    className="bg-accent text-accent-foreground"
                                >
                                    {getInitials(author)}
                                </Avatar>
                            )}
                        </div>
                    );
                })
            ) : (
                <div className="text-sm text-muted-foreground">
                    Комментариев пока нет.
                </div>
            )}
        </div>

        <form
            className="rounded-2xl border border-border bg-card p-3"
            onSubmit={(event) => {
                event.preventDefault();

                if (!isCommentSubmitDisabled) {
                    onSubmitComment();
                }
            }}
        >
            <div className="flex items-center gap-2">
                <Input
                    value={commentDraft}
                    onChange={(event) =>
                        onCommentDraftChange(event.target.value)
                    }
                    placeholder="Напиши комментарий..."
                    className="border-0 bg-transparent px-0 text-foreground placeholder:text-muted-foreground focus-visible:ring-0"
                />
                <Button
                    type="submit"
                    size="icon-sm"
                    disabled={isCommentSubmitDisabled}
                >
                    {isCreatingComment ? (
                        <LoaderCircle className="size-4 animate-spin" />
                    ) : (
                        <SendHorizontal className="size-4" />
                    )}
                </Button>
            </div>
        </form>
    </div>
);

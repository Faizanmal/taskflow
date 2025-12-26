'use client';

import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Reply, Trash2, Edit2, MoreVertical, AtSign } from 'lucide-react';
import { Comment, UserBasic } from '@/lib/types';
import { useComments, useCreateComment, useUpdateComment, useDeleteComment } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TaskCommentsProps {
  taskId: string;
  workspaceMembers?: UserBasic[];
}

export function TaskComments({ taskId, workspaceMembers = [] }: TaskCommentsProps) {
  const { user } = useAuth();
  const { data: comments = [], isLoading } = useComments(taskId);
  const createComment = useCreateComment();

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const mentionedUserIds = extractMentions(newComment, workspaceMembers);

    try {
      await createComment.mutateAsync({
        taskId,
        data: {
          content: newComment,
          parentId: replyingTo ?? undefined,
          mentionedUserIds,
        },
      });
      setNewComment('');
      setReplyingTo(null);
      toast.success('Comment added');
    } catch {
      toast.error('Failed to add comment');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comment form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        {replyingTo && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Reply className="h-4 w-4" />
            Replying to comment
            <button
              type="button"
              onClick={() => setReplyingTo(null)}
              className="text-red-500 hover:underline"
            >
              Cancel
            </button>
          </div>
        )}
        <div className="flex gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.avatar ?? undefined} />
            <AvatarFallback>{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment... Use @ to mention someone"
              className="min-h-[80px] theme-input"
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                <AtSign className="h-3 w-3 inline mr-1" />
                Mention team members with @name
              </span>
              <Button
                type="submit"
                size="sm"
                disabled={!newComment.trim() || createComment.isPending}
                className="btn-accent"
              >
                <Send className="h-4 w-4 mr-1" />
                {createComment.isPending ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              taskId={taskId}
              currentUserId={user?.id ?? ''}
              onReply={() => setReplyingTo(comment.id)}
              workspaceMembers={workspaceMembers}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  taskId: string;
  currentUserId: string;
  onReply: () => void;
  workspaceMembers: UserBasic[];
  depth?: number;
}

function CommentItem({
  comment,
  taskId,
  currentUserId,
  onReply,
  workspaceMembers,
  depth = 0,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const updateComment = useUpdateComment();
  const deleteComment = useDeleteComment();

  const handleUpdate = async () => {
    if (!editContent.trim()) return;

    const mentionedUserIds = extractMentions(editContent, workspaceMembers);

    try {
      await updateComment.mutateAsync({
        id: comment.id,
        taskId,
        data: {
          content: editContent,
          mentionedUserIds,
        },
      });
      setIsEditing(false);
      toast.success('Comment updated');
    } catch {
      toast.error('Failed to update comment');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment.mutateAsync({ id: comment.id, taskId });
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  const isOwner = comment.authorId === currentUserId;

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-11')}>
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={comment.author.avatar ?? undefined} />
        <AvatarFallback>{comment.author.name.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="theme-card rounded-lg p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="font-medium text-sm">{comment.author.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </span>
              {comment.mentions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {comment.mentions.map((mention) => (
                    <span
                      key={mention.id}
                      className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded"
                    >
                      @{mention.user.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[60px] theme-input"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={updateComment.isPending}
                  className="btn-accent"
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setEditContent(comment.content);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-1 text-sm whitespace-pre-wrap">
              {renderContentWithMentions(comment.content)}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 mt-1">
          {depth < 2 && (
            <button
              onClick={onReply}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
            >
              <Reply className="h-3 w-3" />
              Reply
            </button>
          )}
          {comment._count.replies > 0 && (
            <span className="text-xs text-gray-400">
              {comment._count.replies} {comment._count.replies === 1 ? 'reply' : 'replies'}
            </span>
          )}
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-3">
            {comment.replies.map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                taskId={taskId}
                currentUserId={currentUserId}
                onReply={onReply}
                workspaceMembers={workspaceMembers}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to extract @mentions from content
function extractMentions(content: string, members: UserBasic[]): string[] {
  const mentionRegex = /@(\w+)/g;
  const mentions: string[] = [];
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    const username = match[1]?.toLowerCase();
    if (!username) continue;
    const member = members.find(
      (m) => m.name.toLowerCase().includes(username) || m.email.toLowerCase().includes(username)
    );
    if (member && !mentions.includes(member.id)) {
      mentions.push(member.id);
    }
  }

  return mentions;
}

// Helper function to render content with highlighted mentions
function renderContentWithMentions(content: string) {
  const parts = content.split(/(@\w+)/g);
  return parts.map((part, i) => {
    if (part.startsWith('@')) {
      return (
        <span key={i} className="text-accent font-medium">
          {part}
        </span>
      );
    }
    return part;
  });
}

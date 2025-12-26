'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import {
  Upload,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  Download,
  Trash2,
  Loader2,
} from 'lucide-react';
import { Attachment } from '@/lib/types';
import { useAttachments, useUploadAttachment, useDeleteAttachment, useDownloadAttachment } from '@/hooks/useAttachments';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

interface TaskAttachmentsProps {
  taskId: string;
  className?: string;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv',
  'application/zip',
  'video/mp4',
  'audio/mpeg',
];

export function TaskAttachments({ taskId, className }: TaskAttachmentsProps) {
  const { data: attachments = [], isLoading } = useAttachments(taskId);
  const uploadAttachment = useUploadAttachment();
  const deleteAttachment = useDeleteAttachment();
  const downloadAttachment = useDownloadAttachment();

  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        if (file.size > MAX_FILE_SIZE) {
          toast.error(`${file.name} is too large. Max size is 10MB.`);
          continue;
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
          toast.error(`${file.name} has an unsupported file type.`);
          continue;
        }

        setUploadingFiles((prev) => [...prev, file.name]);

        try {
          await uploadAttachment.mutateAsync({ taskId, file });
          toast.success(`${file.name} uploaded`);
        } catch {
          toast.error(`Failed to upload ${file.name}`);
        } finally {
          setUploadingFiles((prev) => prev.filter((f) => f !== file.name));
        }
      }
    },
    [taskId, uploadAttachment]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: MAX_FILE_SIZE,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'text/*': ['.txt', '.csv'],
      'application/zip': ['.zip'],
      'video/*': ['.mp4'],
      'audio/*': ['.mp3'],
    },
  });

  const handleDelete = async (attachment: Attachment) => {
    if (!confirm(`Are you sure you want to delete ${attachment.originalName}?`)) return;

    try {
      await deleteAttachment.mutateAsync({ id: attachment.id, taskId });
      toast.success('Attachment deleted');
    } catch {
      toast.error('Failed to delete attachment');
    }
  };

  const handleDownload = async (attachment: Attachment) => {
    try {
      await downloadAttachment.mutateAsync({
        id: attachment.id,
        filename: attachment.originalName,
      });
    } catch {
      toast.error('Failed to download attachment');
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage;
    if (mimeType.startsWith('video/')) return FileVideo;
    if (mimeType.startsWith('audio/')) return FileAudio;
    if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('word')) {
      return FileText;
    }
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        <div className="h-32 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
        <div className="space-y-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Drop zone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-accent bg-accent/5'
            : 'border-gray-300 dark:border-gray-600 hover:border-accent',
          uploadingFiles.length > 0 && 'pointer-events-none opacity-50'
        )}
        style={isDragActive ? { borderColor: 'var(--accent-color)' } : undefined}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            'h-10 w-10 mx-auto mb-3',
            isDragActive ? 'text-accent' : 'text-gray-400'
          )}
          style={isDragActive ? { color: 'var(--accent-color)' } : undefined}
        />
        {isDragActive ? (
          <p className="text-accent" style={{ color: 'var(--accent-color)' }}>
            Drop files here...
          </p>
        ) : (
          <>
            <p className="text-gray-600 dark:text-gray-300">
              Drag & drop files here, or click to select
            </p>
            <p className="text-sm text-gray-400 mt-1">Max 10MB per file</p>
          </>
        )}
      </div>

      {/* Uploading files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((filename) => (
            <div
              key={filename}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              <Loader2 className="h-5 w-5 animate-spin text-accent" style={{ color: 'var(--accent-color)' }} />
              <span className="text-sm truncate flex-1">{filename}</span>
              <span className="text-xs text-gray-500">Uploading...</span>
            </div>
          ))}
        </div>
      )}

      {/* Attachments list */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => {
            const FileIcon = getFileIcon(attachment.mimeType);
            const isImage = attachment.mimeType.startsWith('image/');

            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 theme-card rounded-lg group"
              >
                {isImage ? (
                  <div className="h-12 w-12 rounded overflow-hidden flex-shrink-0">
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/uploads/${attachment.filename}`}
                      alt={attachment.originalName}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="h-6 w-6 text-gray-500" />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{attachment.originalName}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(attachment.size)} •{' '}
                    {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}
                  </p>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleDownload(attachment)}
                    disabled={downloadAttachment.isPending}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 hover:text-red-600"
                    onClick={() => handleDelete(attachment)}
                    disabled={deleteAttachment.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {attachments.length === 0 && uploadingFiles.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400 py-4">
          No attachments yet
        </p>
      )}
    </div>
  );
}

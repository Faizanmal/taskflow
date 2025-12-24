'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Settings,
  Save,
  Trash2,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useWorkspace, useUpdateWorkspace, useDeleteWorkspace } from '@/hooks/useWorkspaces';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

const ICONS = ['📁', '🚀', '💼', '🎯', '📊', '🔧', '💡', '🎨', '📱', '🌐', '📈', '🛠️'];
const COLORS = [
  '#3B82F6', '#10B981', '#8B5CF6', '#F59E0B',
  '#EF4444', '#EC4899', '#6366F1', '#14B8A6',
];

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const { user } = useAuth();

  const { data: workspace, isLoading } = useWorkspace(workspaceId);
  const updateWorkspace = useUpdateWorkspace();
  const deleteWorkspace = useDeleteWorkspace();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '',
  });
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Initialize form when workspace loads
  useState(() => {
    if (workspace) {
      setFormData({
        name: workspace.name,
        description: workspace.description || '',
        icon: workspace.icon || '',
        color: workspace.color || COLORS[0],
      });
    }
  });

  const isOwner = workspace?.ownerId === user?.id;

  const handleChange = <K extends keyof typeof formData>(key: K, value: typeof formData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      await updateWorkspace.mutateAsync({
        id: workspaceId,
        data: {
          name: formData.name,
          description: formData.description || undefined,
          icon: formData.icon || undefined,
          color: formData.color,
        },
      });
      setHasChanges(false);
      toast.success('Settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== workspace?.name) {
      toast.error('Please type the workspace name to confirm');
      return;
    }

    try {
      await deleteWorkspace.mutateAsync(workspaceId);
      toast.success('Workspace deleted');
      router.push('/dashboard/workspaces');
    } catch (error) {
      toast.error('Failed to delete workspace');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Workspace not found</h1>
        <Link href="/dashboard/workspaces">
          <Button>Back to Workspaces</Button>
        </Link>
      </div>
    );
  }

  // Initialize form data if not yet set
  if (!formData.name && workspace.name) {
    setFormData({
      name: workspace.name,
      description: workspace.description || '',
      icon: workspace.icon || '',
      color: workspace.color || COLORS[0],
    });
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href={`/dashboard/workspaces/${workspaceId}`}
          className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex-1">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Workspace Settings
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure {workspace.name}
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!hasChanges || updateWorkspace.isPending}
          className="btn-accent"
        >
          {updateWorkspace.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        <section className="theme-card rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold">General</h2>

          <div className="space-y-2">
            <Label>Workspace Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Enter workspace name"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="What is this workspace for?"
              rows={3}
            />
          </div>
        </section>

        {/* Appearance */}
        <section className="theme-card rounded-lg p-6 space-y-6">
          <h2 className="text-lg font-semibold">Appearance</h2>

          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => handleChange('icon', icon)}
                  className={`h-10 w-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'ring-2 ring-accent ring-offset-2'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {icon}
                </button>
              ))}
              <button
                type="button"
                onClick={() => handleChange('icon', '')}
                className={`h-10 w-10 rounded-lg text-sm flex items-center justify-center transition-all ${
                  !formData.icon
                    ? 'ring-2 ring-accent ring-offset-2'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                None
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleChange('color', color)}
                  className={`h-10 w-10 rounded-lg transition-all ${
                    formData.color === color ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{
                    backgroundColor: color,
                    ...(formData.color === color && { '--tw-ring-color': color } as React.CSSProperties),
                  }}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center gap-3">
              {formData.icon ? (
                <span className="text-3xl">{formData.icon}</span>
              ) : (
                <div
                  className="h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: formData.color }}
                >
                  {formData.name ? formData.name.charAt(0).toUpperCase() : 'W'}
                </div>
              )}
              <div>
                <div className="font-semibold text-lg">{formData.name || 'Workspace Name'}</div>
                {formData.description && (
                  <div className="text-sm text-gray-500">{formData.description}</div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        {isOwner && (
          <section className="border border-red-200 dark:border-red-900 rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Danger Zone
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Deleting a workspace will permanently remove all tasks, comments, and data associated
              with it. This action cannot be undone.
            </p>

            {!showDeleteConfirm ? (
              <Button
                variant="outline"
                className="border-red-500 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Workspace
              </Button>
            ) : (
              <div className="space-y-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-sm font-medium">
                  Type <strong>{workspace.name}</strong> to confirm deletion:
                </p>
                <Input
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={workspace.name}
                  className="border-red-300 dark:border-red-700"
                />
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={deleteConfirmText !== workspace.name || deleteWorkspace.isPending}
                  >
                    {deleteWorkspace.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Trash2 className="h-4 w-4 mr-2" />
                    )}
                    Delete Forever
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowDeleteConfirm(false);
                      setDeleteConfirmText('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

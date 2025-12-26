'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  FolderKanban,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useCreateWorkspace } from '@/hooks/useWorkspaces';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import toast from 'react-hot-toast';

const ICONS = ['📁', '🚀', '💼', '🎯', '📊', '🔧', '💡', '🎨', '📱', '🌐', '📈', '🛠️'];
const COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#8B5CF6', // purple
  '#F59E0B', // amber
  '#EF4444', // red
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
];

export default function NewWorkspacePage() {
  const router = useRouter();
  const createWorkspace = useCreateWorkspace();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: COLORS[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Please enter a workspace name');
      return;
    }

    try {
      const workspace = await createWorkspace.mutateAsync({
        name: formData.name,
        description: formData.description || undefined,
        icon: formData.icon || undefined,
        color: formData.color,
      });

      toast.success('Workspace created!');
      router.push(`/dashboard/workspaces/${workspace.id}`);
    } catch {
      toast.error('Failed to create workspace');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Link
        href="/dashboard/workspaces"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workspaces
      </Link>

      <div className="theme-card rounded-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <FolderKanban className="h-8 w-8" style={{ color: 'var(--accent-color)' }} />
          <div>
            <h1 className="text-2xl font-bold">Create New Workspace</h1>
            <p className="text-gray-500 dark:text-gray-400">
              Set up a new workspace for your team or project
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Workspace Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Marketing Team, Product Launch"
              className="text-lg"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="What is this workspace for?"
              rows={3}
            />
          </div>

          {/* Icon */}
          <div className="space-y-2">
            <Label>Icon</Label>
            <div className="flex flex-wrap gap-2">
              {ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                  className={`h-10 w-10 rounded-lg text-xl flex items-center justify-center transition-all ${
                    formData.icon === icon
                      ? 'ring-2 ring-accent ring-offset-2'
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  style={
                    formData.icon === icon
                      ? { '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties
                      : undefined
                  }
                >
                  {icon}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, icon: '' }))}
                className={`h-10 w-10 rounded-lg text-sm flex items-center justify-center transition-all ${
                  !formData.icon
                    ? 'ring-2 ring-accent ring-offset-2'
                    : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                style={
                  !formData.icon
                    ? { '--tw-ring-color': 'var(--accent-color)' } as React.CSSProperties
                    : undefined
                }
              >
                None
              </button>
            </div>
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, color }))}
                  className={`h-10 w-10 rounded-lg transition-all ${
                    formData.color === color ? 'ring-2 ring-offset-2' : ''
                  }`}
                  style={{
                    backgroundColor: color,
                    ...(formData.color === color
                      ? { '--tw-ring-color': color } as React.CSSProperties
                      : {}),
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
                <div className="font-semibold text-lg">
                  {formData.name || 'Workspace Name'}
                </div>
                {formData.description && (
                  <div className="text-sm text-gray-500">{formData.description}</div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              className="flex-1 btn-accent"
              disabled={createWorkspace.isPending}
            >
              {createWorkspace.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Create Workspace
            </Button>
            <Link href="/dashboard/workspaces">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

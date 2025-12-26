'use client';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Trash2, AlertTriangle, Loader2, FileJson } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export function PrivacySettings() {
  const { t } = useTranslation();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [acknowledgedDelete, setAcknowledgedDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Export user data
  const exportMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/security/gdpr/export', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to export data');
      return res.json();
    },
    onSuccess: (data) => {
      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Delete account
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/security/gdpr/delete', {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete account');
      return res.json();
    },
    onSuccess: () => {
      // Redirect to login page after account deletion
      window.location.href = '/auth/login?deleted=true';
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleExport = () => {
    setError(null);
    exportMutation.mutate();
  };

  const handleDelete = () => {
    if (deleteConfirmation.toLowerCase() === 'delete my account' && acknowledgedDelete) {
      setError(null);
      deleteMutation.mutate();
    }
  };

  const handleCloseDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteConfirmation('');
    setAcknowledgedDelete(false);
    setError(null);
  };

  return (
    <>
      <div className="space-y-4">
        {/* Data Export */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <FileJson className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {t('security.exportData', 'Export Your Data')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'security.exportDataDescription',
                    'Download a copy of all your data including tasks, workspaces, and settings'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button onClick={handleExport} disabled={exportMutation.isPending}>
              {exportMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {t('security.downloadData', 'Download My Data')}
            </Button>
            {exportMutation.isSuccess && (
              <p className="text-sm text-green-600 mt-2">
                {t('security.exportSuccess', 'Your data has been downloaded successfully.')}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="border-red-200">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-red-100 text-red-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-red-600">
                  {t('security.deleteAccount', 'Delete Account')}
                </CardTitle>
                <CardDescription>
                  {t(
                    'security.deleteAccountDescription',
                    'Permanently delete your account and all associated data'
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>{t('common.warning', 'Warning')}</AlertTitle>
              <AlertDescription>
                {t(
                  'security.deleteWarning',
                  'This action cannot be undone. All your data will be permanently deleted.'
                )}
              </AlertDescription>
            </Alert>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              {t('security.deleteMyAccount', 'Delete My Account')}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={handleCloseDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600">
              {t('security.confirmDeleteAccount', 'Confirm Account Deletion')}
            </DialogTitle>
            <DialogDescription>
              {t(
                'security.deleteAccountInfo',
                'This will permanently delete your account and all data, including:'
              )}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>{t('security.deleteItem1', 'All your tasks and subtasks')}</li>
              <li>{t('security.deleteItem2', 'Your workspaces and settings')}</li>
              <li>{t('security.deleteItem3', 'Comments and attachments')}</li>
              <li>{t('security.deleteItem4', 'Time tracking data')}</li>
              <li>{t('security.deleteItem5', 'Your profile information')}</li>
            </ul>

            <div className="space-y-2">
              <Label htmlFor="delete-confirmation">
                {t('security.typeToConfirm', 'Type "delete my account" to confirm:')}
              </Label>
              <Input
                id="delete-confirmation"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="delete my account"
                className="font-mono"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="acknowledge-delete"
                checked={acknowledgedDelete}
                onCheckedChange={(checked) => setAcknowledgedDelete(checked === true)}
              />
              <Label htmlFor="acknowledge-delete" className="text-sm">
                {t(
                  'security.acknowledgeDelete',
                  'I understand this action is permanent and cannot be undone'
                )}
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDeleteDialog}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={
                deleteConfirmation.toLowerCase() !== 'delete my account' ||
                !acknowledgedDelete ||
                deleteMutation.isPending
              }
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('security.permanentlyDelete', 'Permanently Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PrivacySettings;

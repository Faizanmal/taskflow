'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Shield, Smartphone, Key, Download, Trash2, AlertTriangle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import toast from 'react-hot-toast';

/**
 * Security Settings Component
 * Handles 2FA setup and GDPR compliance features
 * WCAG 2.1 AA compliant
 */
export default function SecuritySettings() {
  const { t } = useTranslation();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // 2FA Setup - Generate Secret
  const setup2FA = useMutation({
    mutationFn: async () => {
      const response = await api.get('/security/2fa/setup');
      return response.data.data;
    },
    onSuccess: (data) => {
      setQrCode(data.qrCode);
      setSecret(data.secret);
      setShow2FASetup(true);
    },
    onError: () => {
      toast.error(t('common.error', 'An error occurred'));
    },
  });

  // 2FA Enable
  const enable2FA = useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post('/security/2fa/enable', { secret, token });
      return response.data.data;
    },
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      toast.success(t('security.2faEnabled', '2FA enabled successfully'));
    },
    onError: () => {
      toast.error(t('security.invalidCode', 'Invalid verification code'));
    },
  });

  // GDPR Export
  const exportData = useMutation({
    mutationFn: async () => {
      const response = await api.get('/security/gdpr/export', {
        responseType: 'blob',
      });
      return response.data;
    },
    onSuccess: (data) => {
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `taskflow-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t('security.dataExported', 'Data exported successfully'));
    },
    onError: () => {
      toast.error(t('common.error', 'An error occurred'));
    },
  });

  // GDPR Delete Account
  const deleteAccount = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/security/gdpr/delete-account', {
        data: { password: deleteConfirmText, confirmation: 'DELETE' },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success(t('security.accountDeleted', 'Account deleted'));
      window.location.href = '/auth/login';
    },
    onError: () => {
      toast.error(t('common.error', 'An error occurred'));
    },
  });

  const handleEnable2FA = useCallback(() => {
    if (verificationCode.length === 6) {
      enable2FA.mutate(verificationCode);
    }
  }, [verificationCode, enable2FA]);

  const handleDeleteAccount = useCallback(() => {
    if (deleteConfirmText.length >= 6) {
      deleteAccount.mutate();
    }
  }, [deleteConfirmText, deleteAccount]);

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[var(--accent-color)]" aria-hidden="true" />
            {t('security.twoFactorAuth', 'Two-Factor Authentication')}
          </CardTitle>
          <CardDescription>
            {t('security.2faDescription', 'Add an extra layer of security to your account')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!show2FASetup ? (
            <Button
              onClick={() => setup2FA.mutate()}
              disabled={setup2FA.isPending}
              className="flex items-center gap-2"
            >
              <Smartphone className="h-4 w-4" aria-hidden="true" />
              {setup2FA.isPending 
                ? t('common.loading', 'Loading...') 
                : t('security.enable2FA', 'Enable 2FA')
              }
            </Button>
          ) : (
            <div className="space-y-4">
              {/* QR Code */}
              {qrCode && !backupCodes.length && (
                <div className="text-center">
                  <p className="text-sm text-[var(--text-secondary)] mb-4">
                    {t('security.scanQR', 'Scan this QR code with your authenticator app')}
                  </p>
                  <img
                    src={qrCode}
                    alt="2FA QR Code"
                    className="mx-auto w-48 h-48 rounded-lg border"
                  />
                  <p className="mt-4 text-xs text-[var(--text-tertiary)]">
                    {t('security.manualEntry', 'Or enter this code manually:')}
                  </p>
                  <code className="block mt-2 p-2 bg-[var(--bg-tertiary)] rounded font-mono text-sm">
                    {secret}
                  </code>
                </div>
              )}

              {/* Verification Input */}
              {qrCode && !backupCodes.length && (
                <div className="space-y-2">
                  <Label htmlFor="verification-code">
                    {t('security.enterCode', 'Enter verification code')}
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="verification-code"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      className="font-mono text-center tracking-widest"
                      aria-describedby="code-hint"
                    />
                    <Button
                      onClick={handleEnable2FA}
                      disabled={verificationCode.length !== 6 || enable2FA.isPending}
                    >
                      {enable2FA.isPending 
                        ? t('common.loading', 'Loading...') 
                        : t('common.confirm', 'Confirm')
                      }
                    </Button>
                  </div>
                  <p id="code-hint" className="text-xs text-[var(--text-tertiary)]">
                    {t('security.codeHint', 'Enter the 6-digit code from your authenticator app')}
                  </p>
                </div>
              )}

              {/* Backup Codes */}
              {backupCodes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-600">
                    <Key className="h-5 w-5" aria-hidden="true" />
                    <span className="font-medium">
                      {t('security.2faSuccess', '2FA enabled successfully!')}
                    </span>
                  </div>
                  <p className="text-sm text-[var(--text-secondary)]">
                    {t('security.backupCodesInfo', 'Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator.')}
                  </p>
                  <div className="grid grid-cols-2 gap-2 p-4 bg-[var(--bg-tertiary)] rounded-lg">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="font-mono text-sm">
                        {code}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Export (GDPR) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-blue-500" aria-hidden="true" />
            {t('security.exportData', 'Export My Data')}
          </CardTitle>
          <CardDescription>
            {t('security.gdprExport', 'Download all your data (GDPR compliance)')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            {t('security.exportDescription', 'Download a copy of all your personal data including tasks, workspaces, comments, and settings.')}
          </p>
          <Button
            variant="outline"
            onClick={() => exportData.mutate()}
            disabled={exportData.isPending}
          >
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            {exportData.isPending 
              ? t('common.loading', 'Loading...') 
              : t('security.downloadData', 'Download My Data')
            }
          </Button>
        </CardContent>
      </Card>

      {/* Delete Account (GDPR) */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" aria-hidden="true" />
            {t('security.deleteAccount', 'Delete Account')}
          </CardTitle>
          <CardDescription>
            {t('security.gdprDelete', 'Permanently delete your account and all data')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-950 rounded-lg mb-4">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-sm text-red-700 dark:text-red-300">
              <p className="font-medium">
                {t('security.deleteWarningTitle', 'This action cannot be undone')}
              </p>
              <p className="mt-1">
                {t('security.deleteWarning', 'All your data will be permanently deleted including tasks, workspaces, comments, and settings.')}
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('security.deleteAccount', 'Delete Account')}
          </Button>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">
              {t('security.confirmDeleteTitle', 'Are you absolutely sure?')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {t('security.confirmDeleteDescription', 'This will permanently delete your account and all associated data. This action cannot be undone.')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Label htmlFor="delete-confirm">
              {t('security.enterPassword', 'Enter your password to confirm')}
            </Label>
            <Input
              id="delete-confirm"
              type="password"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="••••••••"
              className="mt-2"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
              {t('common.cancel', 'Cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText.length < 6 || deleteAccount.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteAccount.isPending 
                ? t('common.loading', 'Loading...') 
                : t('security.confirmDelete', 'Yes, delete my account')
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

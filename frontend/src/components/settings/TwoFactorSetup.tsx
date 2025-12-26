'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Shield, ShieldCheck, ShieldOff, Key, Loader2, Copy, Check } from 'lucide-react';
import Image from 'next/image';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface TwoFactorStatus {
  isEnabled: boolean;
  enabledAt?: string;
}

interface SetupResponse {
  secret: string;
  qrCode: string;
  backupCodes: string[];
}

export function TwoFactorSetup() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [showSetupDialog, setShowSetupDialog] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [setupData, setSetupData] = useState<SetupResponse | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);
  const [step, setStep] = useState<'qr' | 'verify' | 'backup'>('qr');
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Get 2FA status
  const { data: status, isLoading: statusLoading } = useQuery<TwoFactorStatus>({
    queryKey: ['2fa-status'],
    queryFn: async () => {
      const res = await fetch('/api/security/2fa/status', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to get 2FA status');
      return res.json();
    },
  });

  // Generate 2FA secret
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/security/2fa/generate', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to generate 2FA secret');
      return res.json() as Promise<SetupResponse>;
    },
    onSuccess: (data) => {
      setSetupData(data);
      setShowSetupDialog(true);
      setStep('qr');
      setError(null);
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Enable 2FA
  const enableMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch('/api/security/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to enable 2FA');
      }
      return res.json();
    },
    onSuccess: () => {
      setStep('backup');
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  // Disable 2FA
  const disableMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await fetch('/api/security/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to disable 2FA');
      }
      return res.json();
    },
    onSuccess: () => {
      setShowDisableDialog(false);
      setDisableCode('');
      queryClient.invalidateQueries({ queryKey: ['2fa-status'] });
    },
    onError: (err: Error) => {
      setError(err.message);
    },
  });

  const handleCopySecret = async () => {
    if (setupData?.secret) {
      await navigator.clipboard.writeText(setupData.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleCopyBackupCodes = async () => {
    if (setupData?.backupCodes) {
      await navigator.clipboard.writeText(setupData.backupCodes.join('\n'));
      setCopiedBackup(true);
      setTimeout(() => setCopiedBackup(false), 2000);
    }
  };

  const handleVerify = () => {
    if (verificationCode.length === 6) {
      enableMutation.mutate(verificationCode);
    }
  };

  const handleDisable = () => {
    if (disableCode.length === 6) {
      disableMutation.mutate(disableCode);
    }
  };

  const handleCodeChange = (value: string, setter: (val: string) => void) => {
    // Only allow digits
    const digits = value.replace(/\D/g, '').slice(0, 6);
    setter(digits);
  };

  const handleClose = () => {
    setShowSetupDialog(false);
    setSetupData(null);
    setVerificationCode('');
    setStep('qr');
    setError(null);
  };

  if (statusLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>{t('common.loading', 'Loading...')}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2 rounded-full',
                  status?.isEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                )}
              >
                {status?.isEnabled ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : (
                  <Shield className="h-5 w-5" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg">
                  {t('security.twoFactorAuth', 'Two-Factor Authentication')}
                </CardTitle>
                <CardDescription>
                  {status?.isEnabled
                    ? t('security.2faEnabled', 'Your account is protected with 2FA')
                    : t('security.2faDisabled', 'Add an extra layer of security to your account')}
                </CardDescription>
              </div>
            </div>
            {status?.isEnabled ? (
              <Button variant="destructive" onClick={() => setShowDisableDialog(true)}>
                <ShieldOff className="h-4 w-4 mr-2" />
                {t('security.disable2fa', 'Disable')}
              </Button>
            ) : (
              <Button onClick={() => generateMutation.mutate()} disabled={generateMutation.isPending}>
                {generateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Key className="h-4 w-4 mr-2" />
                )}
                {t('security.enable2fa', 'Enable 2FA')}
              </Button>
            )}
          </div>
        </CardHeader>
        {status?.isEnabled && status.enabledAt && (
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {t('security.enabledSince', 'Enabled since')}: {new Date(status.enabledAt).toLocaleDateString()}
            </p>
          </CardContent>
        )}
      </Card>

      {/* Setup Dialog */}
      <Dialog open={showSetupDialog} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {step === 'backup'
                ? t('security.saveBackupCodes', 'Save Backup Codes')
                : t('security.setup2fa', 'Set Up Two-Factor Authentication')}
            </DialogTitle>
            <DialogDescription>
              {step === 'qr' &&
                t('security.scanQrCode', 'Scan this QR code with your authenticator app')}
              {step === 'verify' &&
                t('security.enterCode', 'Enter the 6-digit code from your authenticator app')}
              {step === 'backup' &&
                t('security.backupCodesInfo', 'Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator.')}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 'qr' && setupData && (
            <div className="space-y-4">
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <Image
                  src={setupData.qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {t('security.manualEntry', "Can't scan? Enter this code manually:")}
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                    {setupData.secret}
                  </code>
                  <Button variant="ghost" size="icon" onClick={handleCopySecret}>
                    {copiedSecret ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => handleCodeChange(e.target.value, setVerificationCode)}
                  className="text-center text-2xl tracking-widest font-mono w-48"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 'backup' && setupData && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg">
                {setupData.backupCodes.map((code, index) => (
                  <code key={index} className="text-sm font-mono text-center py-1">
                    {code}
                  </code>
                ))}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleCopyBackupCodes}
              >
                {copiedBackup ? (
                  <>
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    {t('common.copied', 'Copied!')}
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    {t('security.copyBackupCodes', 'Copy Backup Codes')}
                  </>
                )}
              </Button>
            </div>
          )}

          <DialogFooter>
            {step === 'qr' && (
              <Button onClick={() => setStep('verify')} className="w-full">
                {t('common.continue', 'Continue')}
              </Button>
            )}
            {step === 'verify' && (
              <Button
                onClick={handleVerify}
                disabled={verificationCode.length !== 6 || enableMutation.isPending}
                className="w-full"
              >
                {enableMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {t('security.verify', 'Verify & Enable')}
              </Button>
            )}
            {step === 'backup' && (
              <Button onClick={handleClose} className="w-full">
                {t('common.done', 'Done')}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('security.disable2fa', 'Disable Two-Factor Authentication')}</DialogTitle>
            <DialogDescription>
              {t(
                'security.disable2faWarning',
                'This will make your account less secure. Enter your authentication code to confirm.'
              )}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="flex justify-center py-4">
            <Input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              placeholder="000000"
              value={disableCode}
              onChange={(e) => handleCodeChange(e.target.value, setDisableCode)}
              className="text-center text-2xl tracking-widest font-mono w-48"
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              {t('common.cancel', 'Cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disableCode.length !== 6 || disableMutation.isPending}
            >
              {disableMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('security.disable', 'Disable')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TwoFactorSetup;

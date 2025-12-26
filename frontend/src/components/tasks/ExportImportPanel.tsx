'use client';

import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useExportTasks, useImportTasks } from '@/hooks/useBulkTasks';
import toast from 'react-hot-toast';
import Papa from 'papaparse';

interface ExportImportPanelProps {
  workspaceId?: string;
}

/**
 * Export/Import Panel Component
 * Handles exporting tasks to CSV/JSON and importing from files
 */
export default function ExportImportPanel({ workspaceId }: ExportImportPanelProps) {
  const { t } = useTranslation();
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState<Array<{ title: string; description?: string; status?: string; priority?: string; dueDate?: string }>>([]);
  
  const exportTasks = useExportTasks();
  const importTasks = useImportTasks();

  // Handle CSV export
  const handleExportCSV = useCallback(async () => {
    try {
      const result = await exportTasks.mutateAsync({ format: 'csv', workspaceId });
      
      // Create and download file
      const blob = new Blob([result.data], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t('export.success', 'Tasks exported successfully'));
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [exportTasks, workspaceId, t]);

  // Handle JSON export
  const handleExportJSON = useCallback(async () => {
    try {
      const result = await exportTasks.mutateAsync({ format: 'json', workspaceId });
      
      // Create and download file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(t('export.success', 'Tasks exported successfully'));
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [exportTasks, workspaceId, t]);

  // Handle file selection for import
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    if (file.name.endsWith('.csv')) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        Papa.parse(text, {
          header: true,
          complete: (results) => {
            const tasks = (results.data as Record<string, unknown>[])
              .filter((row) => row && typeof row === 'object' && 'title' in row && row.title)
              .map((row) => ({
                title: String(row.title || ''),
                description: row.description ? String(row.description) : undefined,
                status: row.status ? String(row.status) : undefined,
                priority: row.priority ? String(row.priority) : undefined,
                dueDate: row.dueDate ? String(row.dueDate) : undefined,
              }));
            setImportData(tasks);
            setShowImportDialog(true);
          },
        });
      };
      reader.readAsText(file);
    } else if (file.name.endsWith('.json')) {
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          const tasks = Array.isArray(data) ? data : data.tasks || [];
          setImportData(
            tasks.map((task: Record<string, unknown>) => ({
              title: String(task.title || ''),
              description: task.description ? String(task.description) : undefined,
              status: task.status ? String(task.status) : undefined,
              priority: task.priority ? String(task.priority) : undefined,
              dueDate: task.dueDate ? String(task.dueDate) : undefined,
            }))
          );
          setShowImportDialog(true);
        } catch {
          toast.error(t('import.invalidFile', 'Invalid file format'));
        }
      };
      reader.readAsText(file);
    } else {
      toast.error(t('import.unsupportedFormat', 'Unsupported file format. Please use CSV or JSON.'));
    }

    // Reset input
    event.target.value = '';
  }, [t]);

  // Confirm import
  const handleConfirmImport = useCallback(async () => {
    try {
      const result = await importTasks.mutateAsync({
        tasks: importData,
        workspaceId,
      });
      toast.success(t('import.success', `${result.data?.importedCount || importData.length} tasks imported`));
      setShowImportDialog(false);
      setImportData([]);
    } catch (error) {
      toast.error(t('common.error', 'An error occurred'));
    }
  }, [importTasks, importData, workspaceId, t]);

  return (
    <>
      <div className="flex items-center gap-2">
        {/* Export Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="sm"
              disabled={exportTasks.isPending}
              aria-label={t('export.exportTasks', 'Export tasks')}
            >
              <Download className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('export.exportTasks', 'Export')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleExportCSV}>
              <FileSpreadsheet className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('export.exportCSV', 'Export as CSV')}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportJSON}>
              <FileJson className="h-4 w-4 mr-2" aria-hidden="true" />
              {t('export.exportJSON', 'Export as JSON')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Import Button */}
        <Button 
          variant="outline" 
          size="sm"
          aria-label={t('import.importTasks', 'Import tasks')}
          onClick={() => document.getElementById('import-file-input')?.click()}
        >
          <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
          {t('import.importTasks', 'Import')}
        </Button>
        <input
          id="import-file-input"
          type="file"
          accept=".csv,.json"
          onChange={handleFileSelect}
          className="sr-only"
          aria-label={t('import.selectFile', 'Select file to import')}
        />
      </div>

      {/* Import Preview Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('import.preview', 'Import Preview')}</DialogTitle>
            <DialogDescription>
              {t('import.previewDescription', `${importData.length} tasks will be imported`)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview List */}
            <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
              {importData.slice(0, 10).map((task, index) => (
                <div 
                  key={index} 
                  className="py-2 border-b last:border-0 border-[var(--border-color)]"
                >
                  <div className="font-medium text-[var(--text-primary)]">
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="text-sm text-[var(--text-tertiary)] truncate">
                      {task.description}
                    </div>
                  )}
                  <div className="text-xs text-[var(--text-tertiary)] mt-1">
                    {task.status || 'TODO'} • {task.priority || 'MEDIUM'}
                  </div>
                </div>
              ))}
              {importData.length > 10 && (
                <div className="py-2 text-center text-sm text-[var(--text-tertiary)]">
                  {t('import.andMore', `...and ${importData.length - 10} more`)}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowImportDialog(false)}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button
                onClick={handleConfirmImport}
                disabled={importTasks.isPending || importData.length === 0}
              >
                {importTasks.isPending 
                  ? t('common.loading', 'Loading...')
                  : t('import.confirm', 'Import Tasks')
                }
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

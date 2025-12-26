'use client';

import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Upload, FileJson, FileSpreadsheet } from 'lucide-react';
import { useExportTasks, useImportTasks } from '@/hooks/useBulkTasks';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import toast from 'react-hot-toast';

interface ImportExportProps {
  workspaceId?: string;
}

export function ImportExportActions({ workspaceId }: ImportExportProps) {
  const { t } = useTranslation();
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importedData, setImportedData] = useState<Array<{ title: string; description?: string; status?: string; priority?: string }>>([]);

  const exportTasks = useExportTasks();
  const importTasks = useImportTasks();

  const handleExport = useCallback(async (format: 'csv' | 'json') => {
    try {
      const result = await exportTasks.mutateAsync({ format, workspaceId });
      
      if (format === 'csv') {
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, result.filename);
      } else {
        const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
        saveAs(blob, result.filename);
      }
      
      toast.success(t('export.success', 'Tasks exported successfully'));
    } catch (error) {
      toast.error(t('export.error', 'Failed to export tasks'));
    }
  }, [exportTasks, workspaceId, t]);

  const handleImport = useCallback(async () => {
    if (importedData.length === 0) {
      toast.error(t('import.noData', 'No data to import'));
      return;
    }

    try {
      const result = await importTasks.mutateAsync({ 
        tasks: importedData, 
        workspaceId 
      });
      toast.success(t('import.success', `Imported ${result.data.importedCount} tasks`));
      setImportDialogOpen(false);
      setImportedData([]);
    } catch (error) {
      toast.error(t('import.error', 'Failed to import tasks'));
    }
  }, [importTasks, importedData, workspaceId, t]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target?.result as string;
      
      if (file.name.endsWith('.csv')) {
        // Parse CSV
        Papa.parse(content, {
          header: true,
          complete: (results) => {
            const tasks = results.data
              .filter((row: unknown): row is Record<string, string | undefined> => {
                const r = row as Record<string, string | undefined>;
                return !!(r.title || r.Title);
              })
              .map((row: Record<string, string | undefined>) => ({
                title: row.title || row.Title || '',
                description: row.description || row.Description || '',
                status: row.status || row.Status || '',
                priority: row.priority || row.Priority || '',
                dueDate: row.dueDate || row['Due Date'] || '',
              }));
            setImportedData(tasks);
          },
          error: () => {
            toast.error(t('import.parseError', 'Failed to parse CSV file'));
          },
        });
      } else if (file.name.endsWith('.json')) {
        // Parse JSON
        try {
          const data = JSON.parse(content);
          const tasks = Array.isArray(data) ? data : data.tasks || [];
          setImportedData(tasks.map((task: Record<string, string>) => ({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate,
          })));
        } catch {
          toast.error(t('import.parseError', 'Failed to parse JSON file'));
        }
      }
    };
    
    reader.readAsText(file);
  }, [t]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  return (
    <div className="flex items-center gap-2">
      {/* Export Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={exportTasks.isPending}>
            <Download className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('export.exportTasks', 'Export')}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handleExport('csv')}>
            <FileSpreadsheet className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('export.exportCSV', 'Export as CSV')}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleExport('json')}>
            <FileJson className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('export.exportJSON', 'Export as JSON')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" aria-hidden="true" />
            {t('export.importTasks', 'Import')}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('export.importTasks', 'Import Tasks')}</DialogTitle>
            <DialogDescription>
              {t('import.description', 'Upload a CSV or JSON file containing tasks to import.')}
            </DialogDescription>
          </DialogHeader>

          <div
            {...getRootProps()}
            className={`
              mt-4 p-8 border-2 border-dashed rounded-lg text-center cursor-pointer
              transition-colors duration-200
              ${isDragActive 
                ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/10' 
                : 'border-[var(--border-color)] hover:border-[var(--accent-color)]'}
            `}
          >
            <input {...getInputProps()} />
            <Upload className="h-8 w-8 mx-auto mb-2 text-[var(--text-tertiary)]" />
            <p className="text-sm text-[var(--text-secondary)]">
              {isDragActive
                ? t('import.dropHere', 'Drop the file here...')
                : t('export.dragDropFile', 'Drag and drop a file here, or click to select')}
            </p>
            <p className="text-xs text-[var(--text-tertiary)] mt-1">
              {t('import.supportedFormats', 'Supported formats: CSV, JSON')}
            </p>
          </div>

          {importedData.length > 0 && (
            <div className="mt-4">
              <p className="text-sm text-[var(--text-secondary)]">
                {t('import.preview', 'Preview: {{count}} tasks to import', { count: importedData.length })}
              </p>
              <div className="mt-2 max-h-40 overflow-y-auto border rounded p-2">
                {importedData.slice(0, 5).map((task, index) => (
                  <div key={index} className="text-sm py-1 border-b last:border-b-0">
                    {task.title}
                  </div>
                ))}
                {importedData.length > 5 && (
                  <div className="text-xs text-[var(--text-tertiary)] pt-1">
                    {t('import.andMore', 'and {{count}} more...', { count: importedData.length - 5 })}
                  </div>
                )}
              </div>

              <Button
                className="mt-4 w-full"
                onClick={handleImport}
                disabled={importTasks.isPending}
              >
                {importTasks.isPending 
                  ? t('common.loading', 'Loading...') 
                  : t('import.importNow', 'Import Tasks')}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ImportExportActions;

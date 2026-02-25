'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@apollo/client/react';
import { useApplyWizard } from '@/hooks/useApplyWizard';
import { UPLOAD_RESUME } from '@/lib/graphql/mutations';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, FileText, X } from 'lucide-react';

interface StepCVProps {
  /** Called when the user completes or skips this step */
  onComplete: () => void;
}

interface UploadResumeResult {
  candidateUserUploadResume: {
    id: string;
    candidateProfile: {
      resumeUrl?: string | null;
    } | null;
  };
}

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const ACCEPTED_EXTENSIONS = '.pdf,.doc,.docx';
const MAX_FILE_SIZE_MB = 10;

/**
 * Optional CV upload step in the apply wizard.
 *
 * - Accepts .pdf and .docx files (max 10 MB)
 * - Uses candidateUserUploadResume mutation (requires auth JWT)
 * - "Skip for now" is always visible and prominent — many skilled trades
 *   candidates don't have a digital CV and should not be blocked
 * - On successful upload, records resumeUrl in wizard state and advances
 */
export function StepCV({ onComplete }: StepCVProps) {
  const { setResumeFileId, demo } = useApplyWizard();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationError, setValidationError] = useState('');
  const [uploadError, setUploadError] = useState('');

  const [uploadResume, { loading: uploading }] =
    useMutation<UploadResumeResult>(UPLOAD_RESUME);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setValidationError('');
    setUploadError('');

    if (!file) return;

    // Check MIME type, but also fall back to extension check for cases where
    // the browser doesn't set a MIME type (common with PDFs on some mobile browsers)
    const extension = file.name.split('.').pop()?.toLowerCase();
    const validExtensions = ['pdf', 'doc', 'docx'];
    const hasValidType = ACCEPTED_TYPES.includes(file.type);
    const hasValidExtension = extension ? validExtensions.includes(extension) : false;

    if (!hasValidType && !hasValidExtension) {
      setValidationError('Please upload a PDF or Word document (.pdf, .doc, .docx).');
      return;
    }

    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationError(`File is too large. Maximum size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setSelectedFile(file);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setValidationError('');
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUploadAndContinue = async () => {
    if (!selectedFile) return;

    setUploadError('');

    // In demo mode, simulate a successful upload without calling the API
    // (the mutation requires auth which isn't available in demo)
    const isDemo = demo || (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('demo') === 'true');
    if (isDemo) {
      setResumeFileId(`demo-resume-${selectedFile.name}`);
      onComplete();
      return;
    }

    try {
      const result = await uploadResume({
        variables: { resumeFile: selectedFile },
      });

      // Store resume URL in wizard state (used for confirmation page)
      const resumeUrl =
        result.data?.candidateUserUploadResume?.candidateProfile?.resumeUrl;
      if (resumeUrl) {
        setResumeFileId(resumeUrl);
      }

      onComplete();
    } catch {
      setUploadError('Upload failed. Please try again or skip to continue.');
    }
  };

  return (
    <>
      {/* Content area with bottom padding for sticky bar */}
      <div className="space-y-6 pb-28">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Upload your resume / CV</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            A CV helps employers learn more about your experience. If you don&#39;t
            have one ready, you can always add it later.
          </p>
        </div>

        {/* File drop area */}
        <div className="space-y-3">
          {!selectedFile ? (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-lg border-2 border-dashed border-border bg-background px-6 py-10 text-center transition-colors hover:border-primary/50 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Upload className="mx-auto mb-3 size-8 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Tap to select your CV
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF or Word document, up to {MAX_FILE_SIZE_MB} MB
              </p>
            </button>
          ) : (
            <div className="flex items-center gap-3 rounded-lg border border-border bg-accent px-4 py-3">
              <FileText className="size-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={handleClearFile}
                className="shrink-0 rounded-sm text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Remove selected file"
              >
                <X className="size-4" />
              </button>
            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            className="sr-only"
            onChange={handleFileChange}
            aria-label="Upload CV"
          />
        </div>

        {validationError && (
          <p className="text-sm text-destructive">{validationError}</p>
        )}

        {uploadError && (
          <p className="text-sm text-destructive">{uploadError}</p>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="h-4 mb-3" />

          <Button
            type="button"
            className="w-full h-11"
            disabled={!selectedFile || uploading}
            onClick={handleUploadAndContinue}
          >
            {uploading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Continue'
            )}
          </Button>
          <div className="min-h-[2.5rem] mt-2 flex items-start justify-center">
            <p className="text-center text-xs text-muted-foreground">
              You can upload a CV from your profile at any time.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

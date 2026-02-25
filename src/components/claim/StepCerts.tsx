'use client';

import { useState, useRef, useMemo } from 'react';
import { ShieldCheck, Search, Check, Plus, CheckCircle2, Upload, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CERT_TAXONOMY } from '@/lib/cert-taxonomy';

/** A cert with an uploaded file, ready for backend upload */
export interface CertUpload {
  name: string;
  file: File;
  expiry?: string; // ISO date string
}

interface StepCertsProps {
  /** Currently selected cert names */
  selectedCertNames: string[];
  /** Called when selection changes */
  onSelectionChange: (certNames: string[]) => void;
  /** Called when user advances to next step */
  onNext: (uploads: CertUpload[]) => void;
  /** Pre-existing certs from the user's profile (shown as "already on profile") */
  profileCertNames?: string[];
}

/**
 * Step 3 of the claim wizard: certification selection.
 *
 * List-based UI with status pills and upload buttons, adapted from the
 * CertVerification pattern. Category section headers (not collapsible),
 * search filter, and a selected-certs card at the top.
 */
export function StepCerts({
  selectedCertNames,
  onSelectionChange,
  onNext,
  profileCertNames = [],
}: StepCertsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadedCerts, setUploadedCerts] = useState<Record<string, File>>({});
  const [expiryDates, setExpiryDates] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function formatExpiry(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function isExpired(iso: string): boolean {
    return new Date(iso + 'T00:00:00') < new Date();
  }

  // All certs that are "active" — from profile or user picks
  const allSelected = useMemo(
    () => new Set([...profileCertNames, ...selectedCertNames]),
    [selectedCertNames, profileCertNames]
  );

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CERT_TAXONOMY.map((cat) => ({
      category: cat.category,
      certs: cat.certs.filter((name) => !q || name.toLowerCase().includes(q)),
    })).filter((cat) => cat.certs.length > 0);
  }, [searchQuery]);

  const toggleCert = (certName: string) => {
    // Profile certs are always on — cannot be deselected here
    if (profileCertNames.includes(certName)) return;
    const current = new Set(selectedCertNames);
    if (current.has(certName)) {
      current.delete(certName);
    } else {
      current.add(certName);
    }
    onSelectionChange(Array.from(current));
  };

  const handleFileChange = (certName: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedCerts(prev => ({ ...prev, [certName]: file }));
  };

  const handleUploadClick = (certName: string) => {
    fileInputRefs.current[certName]?.click();
  };

  const hasSelection = allSelected.size > 0;

  return (
    <>
      <div className="space-y-5 pb-44">
        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-6" />
            Your certifications
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Uploading a photo of each certification moves you up the candidate list.
          </p>
        </div>

        {/* Selected certs — Verify Your Tickets section */}
        {hasSelection && (
          <Card>
            <CardContent className="space-y-3 pt-5">
              {Array.from(allSelected).map((certName) => {
                const isFromProfile = profileCertNames.includes(certName);
                const isUploaded = certName in uploadedCerts;
                return (
                  <div
                    key={certName}
                    className="rounded-lg border border-border p-4 space-y-2"
                  >
                    {/* Row 1: Name + status badge */}
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">{certName}</span>
                      {(isFromProfile || isUploaded) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <CheckCircle2 className="size-3" />
                          {isFromProfile ? 'Verified' : 'Uploaded'}
                        </span>
                      )}
                    </div>

                    {/* Row 2: Expiry + upload */}
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground shrink-0" />
                      {expiryDates[certName] ? (
                        <span className="text-sm text-muted-foreground">
                          Expires {formatExpiry(expiryDates[certName])}
                          {isExpired(expiryDates[certName]) && (
                            <span className="text-destructive font-medium ml-1">(Expired)</span>
                          )}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="date"
                            value=""
                            onChange={(e) => setExpiryDates(prev => ({ ...prev, [certName]: e.target.value }))}
                            className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm"
                          />
                          {!isFromProfile && !isUploaded && (
                            <>
                              <input
                                ref={(el) => { fileInputRefs.current[certName] = el; }}
                                type="file"
                                accept="image/*,.pdf"
                                capture="environment"
                                className="hidden"
                                onChange={(e) => handleFileChange(certName, e)}
                              />
                              <button
                                type="button"
                                onClick={() => handleUploadClick(certName)}
                                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-primary hover:bg-accent transition-colors shrink-0"
                              >
                                <Upload className="size-3.5" />
                                Upload
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Add Certification link */}
              <div className="border-t border-border pt-3">
                <button
                  type="button"
                  onClick={() => {
                    // Scroll down to the cert taxonomy browser
                    const searchEl = document.querySelector('[data-cert-search]');
                    if (searchEl) searchEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                >
                  <Plus className="size-4" />
                  Add Certification
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            data-cert-search
            type="text"
            inputMode="search"
            placeholder="Search certifications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Cert list grouped by category */}
        <div className="space-y-4">
          {filteredCategories.length === 0 && searchQuery.trim() && (
            <div className="py-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                No certifications match &ldquo;{searchQuery}&rdquo;
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  onSelectionChange([...selectedCertNames, searchQuery.trim()]);
                  setSearchQuery('');
                }}
              >
                <Plus className="size-3.5 mr-1.5" />
                Add &ldquo;{searchQuery.trim()}&rdquo;
              </Button>
            </div>
          )}

          {filteredCategories.map((category) => (
            <div key={category.category}>
              {/* Section label — not collapsible */}
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-0.5">
                {category.category}
              </p>

              <Card className="overflow-hidden py-0">
                <ul className="divide-y divide-border">
                  {category.certs.map((certName) => {
                    const isFromProfile = profileCertNames.includes(certName);
                    const isSelected = allSelected.has(certName);

                    return (
                      <li key={certName}>
                        <button
                          type="button"
                          onClick={() => toggleCert(certName)}
                          disabled={isFromProfile}
                          className={cn(
                            'w-full flex items-center justify-between gap-3 px-4 py-3 text-sm text-left transition-colors',
                            'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                            isSelected && !isFromProfile && 'bg-primary/5',
                            isFromProfile && 'cursor-default'
                          )}
                        >
                          {/* Cert name + status badge */}
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={cn(
                                'font-medium truncate',
                                isSelected ? 'text-foreground' : 'text-foreground'
                              )}
                            >
                              {certName}
                            </span>
                            {isFromProfile && (
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs"
                              >
                                On profile
                              </Badge>
                            )}
                          </div>

                          {/* Toggle indicator */}
                          {!isFromProfile && (
                            <div
                              className={cn(
                                'shrink-0 flex items-center justify-center size-6 rounded-full border-2 transition-colors',
                                isSelected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-background'
                              )}
                            >
                              {isSelected && <Check className="size-3.5" />}
                            </div>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="h-4 mb-3" />

          <Button className="w-full h-11" onClick={() => {
            const uploads: CertUpload[] = Object.entries(uploadedCerts).map(([name, file]) => ({
              name,
              file,
              expiry: expiryDates[name],
            }));
            onNext(uploads);
          }} disabled={!hasSelection}>
            Continue
          </Button>
          <div className="min-h-[2.5rem] mt-2 flex items-start justify-center">
            {hasSelection && (
              <p className="text-xs text-muted-foreground">
                {allSelected.size} ticket{allSelected.size !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

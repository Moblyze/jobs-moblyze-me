'use client';

import { useState, useMemo } from 'react';
import { ShieldCheck, Search, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CERT_TAXONOMY } from '@/lib/cert-taxonomy';

interface StepCertsProps {
  /** Currently selected cert names */
  selectedCertNames: string[];
  /** Called when selection changes */
  onSelectionChange: (certNames: string[]) => void;
  /** Called when user advances to next step */
  onNext: () => void;
  /** Pre-existing certs from the user's profile (shown as "already on profile") */
  profileCertNames?: string[];
}

/**
 * Step 3 of the claim wizard: certification selection.
 *
 * List-based UI with status pills and verify buttons, adapted from the
 * CertVerification pattern. Category section headers (not collapsible),
 * search filter, and a selected-certs card at the top.
 *
 * "Skip" / "Continue" collapses to a single button in the bottom bar.
 */
export function StepCerts({
  selectedCertNames,
  onSelectionChange,
  onNext,
  profileCertNames = [],
}: StepCertsProps) {
  const [searchQuery, setSearchQuery] = useState('');

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

  const hasSelection = allSelected.size > 0;

  return (
    <>
      <div className="space-y-5 pb-28">
        {/* Heading */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-6" />
            Your certifications
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Adding your tickets helps match you with the right jobs. You can skip
            this and add them later.
          </p>
        </div>

        {/* Selected / profile certs card — CertVerification pattern */}
        {hasSelection && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShieldCheck className="size-4" />
                Your selected tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {Array.from(allSelected).map((certName) => {
                  const isFromProfile = profileCertNames.includes(certName);
                  return (
                    <li
                      key={certName}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-medium truncate">{certName}</span>
                        {isFromProfile ? (
                          <Badge
                            variant="secondary"
                            className="shrink-0 text-xs"
                          >
                            On profile
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="shrink-0 text-xs text-muted-foreground"
                          >
                            Unverified
                          </Badge>
                        )}
                      </div>

                      {/* Disabled verify button — coming soon */}
                      <div
                        className="shrink-0"
                        title="Verification coming soon"
                        aria-label="Verification coming soon"
                      >
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          aria-disabled="true"
                        >
                          Verify
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>

              <p className="mt-4 text-xs text-muted-foreground">
                Upload a photo of your ticket to verify. This feature is coming soon.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
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
                            isSelected && !isFromProfile && 'bg-teal-50 dark:bg-teal-950/30',
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
                            {isFromProfile ? (
                              <Badge
                                variant="secondary"
                                className="shrink-0 text-xs"
                              >
                                On profile
                              </Badge>
                            ) : isSelected ? (
                              <Badge
                                variant="outline"
                                className="shrink-0 text-xs text-muted-foreground"
                              >
                                Unverified
                              </Badge>
                            ) : null}
                          </div>

                          {/* Toggle indicator */}
                          {!isFromProfile && (
                            <div
                              className={cn(
                                'shrink-0 flex items-center justify-center size-6 rounded-full border-2 transition-colors',
                                isSelected
                                  ? 'border-teal-600 bg-teal-600 text-white'
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

      {/* Sticky bottom bar — single button */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {hasSelection && (
            <p className="text-xs text-muted-foreground text-center mb-2">
              {allSelected.size} ticket{allSelected.size !== 1 ? 's' : ''} selected
            </p>
          )}
          <Button className="w-full h-11" onClick={onNext}>
            {hasSelection ? 'Continue' : 'Skip'}
          </Button>
        </div>
      </div>
    </>
  );
}

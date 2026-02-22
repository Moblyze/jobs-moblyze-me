'use client';

import { useState, useMemo } from 'react';
import { ShieldCheck, Search, ChevronDown, Check, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
 * Category accordion + search, same UX pattern as StepRoles.
 * User can select existing certs and add new ones.
 * "Skip" is always available — certs are optional.
 */
export function StepCerts({ selectedCertNames, onSelectionChange, onNext, profileCertNames = [] }: StepCertsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const allSelected = useMemo(
    () => new Set([...selectedCertNames, ...profileCertNames]),
    [selectedCertNames, profileCertNames]
  );

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return CERT_TAXONOMY
      .map((cat) => ({
        category: cat.category,
        certs: cat.certs.filter((name) => !q || name.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.certs.length > 0);
  }, [searchQuery]);

  const toggleCert = (certName: string) => {
    if (profileCertNames.includes(certName)) return; // Can't deselect profile certs
    const current = new Set(selectedCertNames);
    if (current.has(certName)) {
      current.delete(certName);
    } else {
      current.add(certName);
    }
    onSelectionChange(Array.from(current));
  };

  const toggleCategory = (name: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const isCategoryExpanded = (name: string) => {
    if (searchQuery.trim()) return true;
    return expandedCategories.has(name);
  };

  return (
    <>
      <div className="space-y-5 pb-28">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-6" />
            Your certifications
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Adding your tickets helps match you with the right jobs.
            You can skip this and add them later.
          </p>
        </div>

        {/* Profile certs already on file */}
        {profileCertNames.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
              Already on your profile
            </p>
            <div className="flex flex-wrap gap-2">
              {profileCertNames.map((name) => (
                <span
                  key={name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary bg-primary text-primary-foreground px-4 py-2.5 text-sm font-medium"
                >
                  <Check className="size-3.5" />
                  {name}
                </span>
              ))}
            </div>
          </div>
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

        {/* Category accordion */}
        <div className="space-y-1">
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

          {filteredCategories.map((category) => {
            const isExpanded = isCategoryExpanded(category.category);
            const selectedInCategory = category.certs.filter((c) => allSelected.has(c)).length;

            return (
              <div key={category.category} className="border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => toggleCategory(category.category)}
                  className="w-full flex items-center justify-between px-3.5 py-3 text-sm font-medium text-foreground hover:bg-accent transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span>{category.category}</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {category.certs.length}
                    </span>
                    {selectedInCategory > 0 && (
                      <span className="inline-flex items-center justify-center min-w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-medium px-1.5">
                        {selectedInCategory}
                      </span>
                    )}
                  </div>
                  <ChevronDown
                    className={cn(
                      'size-4 text-muted-foreground transition-transform',
                      isExpanded && 'rotate-180'
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    {category.certs.map((certName) => {
                      const isFromProfile = profileCertNames.includes(certName);
                      const isSelected = allSelected.has(certName);
                      return (
                        <button
                          key={certName}
                          type="button"
                          onClick={() => toggleCert(certName)}
                          disabled={isFromProfile}
                          className={cn(
                            'w-full flex items-center gap-3 px-3.5 py-2.5 text-sm text-left transition-colors',
                            'hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
                            isSelected && 'bg-primary/5',
                            isFromProfile && 'opacity-60 cursor-not-allowed'
                          )}
                        >
                          <div
                            className={cn(
                              'flex items-center justify-center size-5 rounded border shrink-0 transition-colors',
                              isSelected
                                ? 'border-primary bg-primary text-primary-foreground'
                                : 'border-border bg-background'
                            )}
                          >
                            {isSelected && <Check className="size-3" />}
                          </div>
                          <span className={cn(isSelected && 'font-medium')}>
                            {certName}
                          </span>
                          {isFromProfile && (
                            <span className="ml-auto text-xs text-muted-foreground">On profile</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 shadow-[0_-2px_8px_rgba(0,0,0,0.08)] bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2">
          {selectedCertNames.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-xs font-medium text-muted-foreground shrink-0">
                {allSelected.size} selected:
              </span>
              <div className="flex gap-1.5">
                {Array.from(allSelected).map((name) => (
                  <span
                    key={name}
                    className="inline-flex items-center whitespace-nowrap rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 h-11"
              onClick={onNext}
            >
              Skip
            </Button>
            <Button
              className="flex-1 h-11"
              onClick={onNext}
            >
              {allSelected.size > 0 ? 'Continue' : 'Skip'}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

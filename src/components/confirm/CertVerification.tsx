'use client';

import { useState, useRef } from 'react';
import { ShieldCheck, CheckCircle2, Upload, Calendar, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface CertEntry {
  id: string;
  name: string;
  status: 'verified' | 'uploaded' | 'pending';
  expiry?: string | null;
}

/**
 * Demo certifications matching the approved UI.
 *
 * TODO: In a future phase, pull these from the candidate's actual
 * profile/wizard state — certs claimed during onboarding or
 * extracted from uploaded CV.
 */
const DEMO_CERTS: CertEntry[] = [
  { id: '1', name: 'Red Seal Electrician', status: 'verified', expiry: 'Jun 15, 2028' },
  { id: '2', name: 'WHMIS 2015', status: 'uploaded', expiry: 'Nov 20, 2026' },
  { id: '3', name: 'H2S Alive', status: 'pending', expiry: null },
];

/**
 * Cert verification UI for the confirmation page.
 *
 * Three states per cert:
 * - Verified: green "Verified" badge + expiry date
 * - Uploaded: green "Uploaded" badge + expiry date (awaiting review)
 * - Pending: date input + Upload button
 *
 * Includes "+ Add Certification" at the bottom to add more.
 */
export function CertVerification() {
  const [certs, setCerts] = useState<CertEntry[]>(DEMO_CERTS);
  const [addingCert, setAddingCert] = useState(false);
  const [newCertName, setNewCertName] = useState('');
  const newCertInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (certId: string) => {
    // Demo: simulate upload by changing status to 'uploaded'
    setCerts((prev) =>
      prev.map((c) =>
        c.id === certId ? { ...c, status: 'uploaded' as const, expiry: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) } : c
      )
    );
  };

  const handleExpiryChange = (certId: string, value: string) => {
    if (!value) return;
    const date = new Date(value + 'T00:00:00');
    const formatted = date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
    setCerts((prev) =>
      prev.map((c) => (c.id === certId ? { ...c, expiry: formatted } : c))
    );
  };

  const handleAddCert = () => {
    if (!newCertName.trim()) return;
    setCerts((prev) => [
      ...prev,
      { id: `new-${Date.now()}`, name: newCertName.trim(), status: 'pending', expiry: null },
    ]);
    setNewCertName('');
    setAddingCert(false);
  };

  if (certs.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ShieldCheck className="size-4" />
          Verify Your Tickets
        </CardTitle>
        <CardDescription>
          Uploading a photo of each certification moves you up the candidate list.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {certs.map((cert) => (
          <div
            key={cert.id}
            className="rounded-lg border border-border p-3 space-y-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium">{cert.name}</span>
              {cert.status === 'verified' && (
                <Badge variant="outline" className="shrink-0 text-xs text-green-600 border-green-200 bg-green-50">
                  <CheckCircle2 className="size-3 mr-1" />
                  Verified
                </Badge>
              )}
              {cert.status === 'uploaded' && (
                <Badge variant="outline" className="shrink-0 text-xs text-green-600 border-green-200 bg-green-50">
                  <CheckCircle2 className="size-3 mr-1" />
                  Uploaded
                </Badge>
              )}
            </div>

            {cert.status === 'verified' && cert.expiry && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                Expires {cert.expiry}
              </div>
            )}

            {cert.status === 'uploaded' && cert.expiry && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                Expires {cert.expiry}
              </div>
            )}

            {cert.status === 'pending' && (
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                  <Input
                    type="date"
                    className="pl-8 h-9 text-sm"
                    placeholder="Expiry date"
                    onChange={(e) => handleExpiryChange(cert.id, e.target.value)}
                  />
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1.5"
                  onClick={() => handleUpload(cert.id)}
                >
                  <Upload className="size-3.5" />
                  Upload
                </Button>
              </div>
            )}
          </div>
        ))}

        {/* Add Certification */}
        {addingCert ? (
          <div className="flex items-center gap-2 pt-1">
            <Input
              ref={newCertInputRef}
              type="text"
              placeholder="Certification name"
              value={newCertName}
              onChange={(e) => setNewCertName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddCert()}
              className="h-9 text-sm"
              autoFocus
            />
            <Button size="sm" variant="outline" onClick={handleAddCert} disabled={!newCertName.trim()}>
              Add
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setAddingCert(false); setNewCertName(''); }}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setAddingCert(true)}
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors pt-1"
          >
            <Plus className="size-4" />
            Add Certification
          </button>
        )}
      </CardContent>
    </Card>
  );
}

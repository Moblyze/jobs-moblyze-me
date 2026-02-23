'use client';

import { useState } from 'react';
import { Calendar, Check } from 'lucide-react';

interface StartDateCalloutProps {
  startDateText: string;
}

export function StartDateCallout({ startDateText }: StartDateCalloutProps) {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="mt-4 border-l-4 border-primary bg-primary/5 px-4 py-3 rounded-r-lg">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary shrink-0" />
          <span className="text-sm font-semibold">Starts {startDateText}</span>
        </div>
        <button
          type="button"
          onClick={() => setConfirmed((prev) => !prev)}
          className={`
            inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium
            transition-all duration-200 active:scale-95
            ${
              confirmed
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-white text-muted-foreground border border-border hover:border-primary/40 hover:text-foreground'
            }
          `}
        >
          {confirmed && <Check className="h-3 w-3" />}
          {confirmed ? 'Available' : "I'm Available"}
        </button>
      </div>
    </div>
  );
}

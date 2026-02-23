'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * Demo lock-screen page.
 * Simulates an iOS lock screen with push, SMS, and email notifications.
 * Tapping any notification navigates to the white-label preview job page.
 */
export default function DemoPage() {
  return (
    <Suspense>
      <DemoPageContent />
    </Suspense>
  );
}

function DemoPageContent() {
  const searchParams = useSearchParams();
  const returning = searchParams.get('returning') === 'true';
  const previewHref = returning ? '/preview?returning=true' : '/preview';

  // Format today's date like "Wednesday, February 19"
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-[100dvh] bg-black flex flex-col items-center overflow-hidden select-none">
        {/* Lock screen chrome */}
        <div className="pt-16 pb-6 text-center">
          <p className="text-white/60 text-sm font-medium tracking-wide">
            {dateString}
          </p>
          <p className="text-white text-[80px] font-light leading-none -tracking-[2px] mt-1">
            9:41
          </p>
        </div>

        {/* Notifications — push, SMS, email */}
        <div className="w-full px-4 mt-8 space-y-3">

          {/* Push notification */}
          <Link
            href={previewHref}
            className="block w-full max-w-[400px] mx-auto rounded-[14px] bg-white/10 backdrop-blur-xl p-3.5 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2 mb-1.5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/moblyze-app-icon.webp`}
                alt="Moblyze"
                width={20}
                height={20}
                className="rounded-[4px]"
              />
              <span className="text-white/50 text-[11px] font-semibold uppercase tracking-wider">
                Moblyze
              </span>
              <span className="text-white/30 text-[11px] ml-auto">now</span>
            </div>
            <p className="text-white text-[15px] font-semibold leading-snug">
              New Hitch starting March 3
            </p>
            <p className="text-white/70 text-[14px] leading-snug mt-0.5 line-clamp-2">
              Are you available for this Electrician job in TX? Tap for details.
            </p>
          </Link>

          {/* SMS notification */}
          <Link
            href={previewHref}
            className="block w-full max-w-[400px] mx-auto rounded-[14px] bg-white/10 backdrop-blur-xl p-3.5 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2 mb-1.5">
              {/* Green SMS bubble icon */}
              <div className="w-5 h-5 rounded-[4px] bg-green-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
              </div>
              <span className="text-white/50 text-[11px] font-semibold uppercase tracking-wider">
                Messages
              </span>
              <span className="text-white/30 text-[11px] ml-auto">now</span>
            </div>
            <p className="text-white text-[15px] font-semibold leading-snug">
              Moblyze
            </p>
            <p className="text-white/70 text-[14px] leading-snug mt-0.5 line-clamp-2">
              New hitch starting March 3 — Electrician in Houston, TX. $38-45/hr. Tap to apply: moblyze.app.link/j/12345
            </p>
          </Link>

          {/* Email notification */}
          <Link
            href={previewHref}
            className="block w-full max-w-[400px] mx-auto rounded-[14px] bg-white/10 backdrop-blur-xl p-3.5 active:scale-[0.98] transition-transform"
          >
            <div className="flex items-center gap-2 mb-1.5">
              {/* Blue mail icon */}
              <div className="w-5 h-5 rounded-[4px] bg-blue-500 flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <span className="text-white/50 text-[11px] font-semibold uppercase tracking-wider">
                Mail
              </span>
              <span className="text-white/30 text-[11px] ml-auto">now</span>
            </div>
            <p className="text-white text-[15px] font-semibold leading-snug">
              New hitch available near you
            </p>
            <p className="text-white/70 text-[14px] leading-snug mt-0.5 line-clamp-2">
              Gulf Coast Energy Services is hiring a Journeyman Electrician in Houston, TX starting March 3. Tap to view details and apply.
            </p>
          </Link>

        </div>

        {/* Bottom home indicator bar (iOS visual) */}
        <div className="mt-auto pb-2">
          <div className="w-36 h-1.5 bg-white/20 rounded-full mx-auto" />
        </div>
    </div>
  );
}

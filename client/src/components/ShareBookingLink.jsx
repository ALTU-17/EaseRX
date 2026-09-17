import React, { useState } from 'react';

export default function ShareBookingLink() {
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState('');

  const bookingUrl = `${window.location.origin}/book`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&margin=10&data=${encodeURIComponent(bookingUrl)}`;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(bookingUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('Copy this link:', bookingUrl);
    }
  };

  const downloadQr = async () => {
    setDownloading(true);
    setDownloadError('');
    try {
      const res = await fetch(qrSrc);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'easerx-booking-qr.png';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Couldn't download the QR code. Try again.");
    } finally {
      setDownloading(false);
    }
  };

  const shareOptions = [
    {
      key: 'copy',
      icon: copied ? 'check' : 'content_copy',
      label: copied ? 'Link Copied!' : 'Copy Link',
      sub: bookingUrl,
      onClick: copyLink,
    },
    {
      key: 'qr',
      icon: 'qr_code_2',
      label: showQr ? 'Hide QR Code' : 'Show QR Code',
      sub: 'Scan to open the booking page',
      onClick: () => setShowQr((s) => !s),
    },
    {
      key: 'download',
      icon: 'download',
      label: downloading ? 'Preparing PNG…' : 'Download QR (PNG)',
      sub: 'Save the QR code to print for your clinic',
      onClick: downloadQr,
      disabled: downloading,
    },
  ];

  return (
    <div className="bg-surface-container-lowest rounded-xl shadow-card border border-surface-variant overflow-hidden">
      <div className="p-4 border-b border-surface-variant flex items-center gap-3">
        <span className="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center">
          <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
        </span>
        <div>
          <h3 className="text-title-lg font-bold text-on-background">Patient Booking Link</h3>
          <p className="text-xs text-on-surface-variant">Share this so patients can book their own slot.</p>
        </div>
      </div>

      <ul className="divide-y divide-surface-variant">
        {shareOptions.map((opt) => (
          <li key={opt.key}>
            <button
              onClick={opt.onClick}
              disabled={opt.disabled}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-surface-container-low transition-colors disabled:opacity-60"
            >
              <span className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                <span className="material-symbols-outlined text-[18px] text-primary">{opt.icon}</span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-on-background">{opt.label}</span>
                <span className="block text-xs text-on-surface-variant truncate">{opt.sub}</span>
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px] flex-shrink-0">chevron_right</span>
            </button>
          </li>
        ))}
      </ul>

      {downloadError && (
        <p className="px-4 pb-3 text-xs text-error">{downloadError}</p>
      )}

      {showQr && (
        <div className="flex flex-col items-center gap-2 px-4 pb-4">
          <img
            src={qrSrc}
            alt="QR code for the patient booking page"
            className="w-40 h-40 rounded-lg border border-surface-variant"
          />
          <p className="text-xs text-on-surface-variant text-center">
            Scan to open the booking page on a phone.
          </p>
        </div>
      )}
    </div>
  );
}
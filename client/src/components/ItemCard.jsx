import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { User, Clock, Link as LinkIcon, ExternalLink } from 'lucide-react';

function formatDate(dateString) {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '-';
  }
}

export default function ItemCard({ item, onClick }) {
  return (
    <article
      onClick={() => onClick(item)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#FFFFFF] border border-[#EFE8DE] hover:border-[#D4A373] hover:shadow-md hover:shadow-[#8C6239]/5 transition-all duration-200 cursor-pointer"
    >
      {/* Bagian Atas: Kiri (Judul & Waktu & Pembuat), Kanan (Barcode / QR) */}
      <div className="flex items-start justify-between gap-4 mb-4">
        
        {/* Sebelah Kiri: Judul dan Waktu Dibuat */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-[#261C14] group-hover:text-[#8C6239] transition-colors line-clamp-2 leading-snug mb-2">
            {item.title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#786858]">
            {/* Pembuat */}
            <div className="flex items-center gap-1 font-medium">
              <User className="w-3.5 h-3.5 text-[#B48248] shrink-0" />
              <span className="truncate max-w-[120px]">{item.creator || 'Anonim'}</span>
            </div>

            {/* Waktu Dibuat */}
            <div className="flex items-center gap-1 text-[#9E8C7C]">
              <Clock className="w-3.5 h-3.5 text-[#B48248]/70 shrink-0" />
              <time dateTime={item.createdAt}>
                {formatDate(item.createdAt)}
              </time>
            </div>
          </div>
        </div>

        {/* Sebelah Kanan: Barcode / QR Code */}
        <div 
          className="shrink-0 p-1.5 rounded-xl bg-[#FAF8F5] border border-[#E5DACB] shadow-2xs group-hover:border-[#B48248]/40 transition-colors"
          title="Scan barcode untuk membuka link di ponsel"
        >
          <QRCodeSVG 
            value={item.url || 'https://vaultra.app'} 
            size={52}
            bgColor="transparent"
            fgColor="#261C14"
            level="L"
          />
        </div>

      </div>

      {/* Bagian Bawah: Link URL */}
      <div className="pt-3 border-t border-[#F5EFEB] flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 min-w-0 text-[#8C6239]">
          <LinkIcon className="w-3.5 h-3.5 shrink-0 text-[#B48248]" />
          <span 
            className="truncate font-mono text-[11.5px] hover:underline"
            title={item.url}
          >
            {item.url}
          </span>
        </div>
        
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="p-1 rounded-md text-[#9E8C7C] hover:text-[#8C6239] hover:bg-[#F5EFEB] transition-colors shrink-0"
          title="Buka langsung di tab baru"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

    </article>
  );
}

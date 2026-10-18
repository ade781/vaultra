import React from 'react';
import { User, Clock, Mail, ExternalLink } from 'lucide-react';

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
      {/* Judul Link */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#261C14] group-hover:text-[#8C6239] transition-colors line-clamp-2 leading-snug">
          {item.title}
        </h3>
      </div>

      {/* Info Meta: Pembuat, Asal Email, Tanggal Dibuat */}
      <div className="pt-3 border-t border-[#F5EFEB] flex flex-wrap items-center justify-between gap-y-2 text-xs text-[#786858]">
        
        {/* Pembuat & Email */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-[#B48248] shrink-0" />
            <span className="truncate max-w-[120px]">{item.creator || 'Anonim'}</span>
          </div>

          {item.sourceEmail && (
            <div className="flex items-center gap-1 font-mono text-[11px] text-[#786858]">
              <Mail className="w-3.5 h-3.5 text-[#B48248]/80 shrink-0" />
              <span className="truncate max-w-[140px]">{item.sourceEmail}</span>
            </div>
          )}
        </div>

        {/* Waktu Dibuat */}
        <div className="flex items-center gap-1 text-[#9E8C7C] shrink-0">
          <Clock className="w-3.5 h-3.5 text-[#B48248]/70 shrink-0" />
          <time dateTime={item.createdAt}>
            {formatDate(item.createdAt)}
          </time>
        </div>

      </div>
    </article>
  );
}

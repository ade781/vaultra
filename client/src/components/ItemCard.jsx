import React from 'react';
import { User, Clock, Mail, Globe, Lock, Share2 } from 'lucide-react';

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
  const isPrivate = Boolean(item.isPrivate);

  return (
    <article
      onClick={() => onClick(item)}
      className="group relative flex flex-col justify-between p-5 rounded-2xl bg-[#FFFFFF] border border-[#EBE3D5] hover:border-[#B48248] hover:shadow-md hover:shadow-[#8C6239]/8 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Top Wood Grain Accent Strip */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#8C6239] via-[#D4A373] to-[#8C6239] opacity-70 group-hover:opacity-100 transition-opacity" />

      {/* Header: Title & Privacy Badge */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          <h3 className="text-base font-semibold text-[#261C14] group-hover:text-[#8C6239] transition-colors line-clamp-2 leading-snug flex-1">
            {item.title}
          </h3>

          {/* Public / Private Badge */}
          {isPrivate ? (
            <span 
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#FBF0E4] text-[#8C6239] border border-[#E8CDB5] shrink-0"
              title={item.sharedWith ? `Tautan privat dibagikan ke @${item.sharedWith}` : 'Tautan privat'}
            >
              <Lock className="w-3 h-3 stroke-[2.5]" />
              <span>Private</span>
            </span>
          ) : (
            <span 
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#F0F6EE] text-[#4A6B3D] border border-[#CFE1C9] shrink-0"
              title="Tautan publik dapat diakses semua orang"
            >
              <Globe className="w-3 h-3 stroke-[2.5]" />
              <span>Publik</span>
            </span>
          )}
        </div>

        {/* If Private and sharedWith is set */}
        {isPrivate && item.sharedWith && (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#FAF4ED] text-[#8C6239] text-[11px] font-medium border border-[#E5DACB]">
            <Share2 className="w-3 h-3 text-[#B48248]" />
            <span>Dibagi ke: <strong className="font-semibold text-[#5E3F21]">@{item.sharedWith}</strong></span>
          </div>
        )}
      </div>

      {/* Info Meta: Pembuat, Asal Email, Tanggal Dibuat */}
      <div className="pt-3 border-t border-[#F5EFEB] flex flex-wrap items-center justify-between gap-y-2 text-xs text-[#786858]">
        
        {/* Pembuat & Email */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <div className="flex items-center gap-1.5 font-medium">
            <User className="w-3.5 h-3.5 text-[#B48248] shrink-0" />
            <span className="truncate max-w-[120px] text-[#261C14]">{item.creator || 'Anonim'}</span>
          </div>

          {item.sourceEmail && (
            <div className="flex items-center gap-1 font-mono text-[11px] text-[#786858]">
              <Mail className="w-3.5 h-3.5 text-[#B48248]/80 shrink-0" />
              <span className="truncate max-w-[130px]">{item.sourceEmail}</span>
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

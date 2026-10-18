import React from 'react';
import { User, Clock, Mail, Globe, Lock, Share2 } from 'lucide-react';
import { getWoodPlank } from '../utils/woodTextures';

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
  const woodTexture = getWoodPlank(item.id || item.title || 0);

  return (
    <article
      onClick={() => onClick(item)}
      className="group relative flex flex-col justify-between rounded-2xl bg-[#FFFFFF] border border-[#E5DACB] hover:border-[#B48248] shadow-sm hover:shadow-xl hover:shadow-[#8C6239]/15 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* 1. Prominent Wooden Plank Header Cap (Tekstur Kayu Nyata yang Menonjol) */}
      <div 
        className="relative h-12 w-full px-4.5 flex items-center justify-between border-b border-[#3D271D]/40 overflow-hidden shadow-xs"
        style={{
          backgroundImage: `linear-gradient(rgba(35, 20, 12, 0.4), rgba(45, 25, 15, 0.65)), url(${woodTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Subtle Brass Inlay Detail */}
        <div className="flex items-center gap-1.5 drop-shadow-xs">
          <div className="w-1.5 h-1.5 rounded-full bg-[#E5B57A] shadow-[inset_0_1px_1px_rgba(255,255,255,0.7),0_1px_2px_rgba(0,0,0,0.8)]" />
          <span className="text-[11px] font-bold tracking-wider uppercase text-[#FCEBD4] drop-shadow-sm">
            Tautan #{item.id || 1}
          </span>
        </div>

        {/* Public / Private Badge with Brass/Wood Pill Styling */}
        {isPrivate ? (
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#26160D]/85 text-[#FCE3C3] border border-[#D4A373]/60 shadow-sm"
            title={item.sharedWith ? `Tautan privat dibagikan ke @${item.sharedWith}` : 'Tautan privat'}
          >
            <Lock className="w-3 h-3 stroke-[2.5] text-[#FFCC00]" />
            <span>Private</span>
          </span>
        ) : (
          <span 
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#1E3316]/85 text-[#D7F2CB] border border-[#7CB364]/60 shadow-sm"
            title="Tautan publik dapat diakses semua orang"
          >
            <Globe className="w-3 h-3 stroke-[2.5] text-[#9EE37D]" />
            <span>Publik</span>
          </span>
        )}

        {/* Bottom Wood Bevel Shadow Line */}
        <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-black/40" />
      </div>

      {/* 2. Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        
        {/* Header: Title */}
        <div className="mb-4">
          <h3 className="text-base font-semibold text-[#261C14] group-hover:text-[#8C6239] transition-colors line-clamp-2 leading-snug">
            {item.title}
          </h3>

          {/* If Private and sharedWith is set */}
          {isPrivate && item.sharedWith && (
            <div className="inline-flex items-center gap-1.5 mt-2 px-2.5 py-0.5 rounded-md bg-[#FAF4ED] text-[#8C6239] text-[11px] font-medium border border-[#E5DACB]">
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
      </div>

      {/* 3. Subtle Bottom Wood Plank Footer Edge */}
      <div 
        className="h-1.5 w-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{
          backgroundImage: `url(${woodTexture})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
    </article>
  );
}

import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Calendar,
  Tag as TagIcon
} from 'lucide-react';
import { getDriveTypeMeta, formatDate } from '../utils/driveHelper';

export default function ItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  onSelectTag,
  onCopySuccess
}) {
  const [copied, setCopied] = useState(false);
  const meta = getDriveTypeMeta(item.driveType);
  const IconComponent = meta.icon;

  const handleCopy = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(true);
      if (onCopySuccess) onCopySuccess(item.title);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  // Safe category information
  const category = item.category;
  const categoryColor = category?.color || '#6366f1';

  // Normalize tags (can be item.tags as [{ tag: { id, name } }] or [{ id, name }])
  const tagList = (item.tags || []).map((t) => t.tag || t);

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-slate-900/80 border border-slate-800/80 p-5 transition-all duration-300 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-950/20 hover:-translate-y-0.5">
      {/* Top Header: Drive Type Badge & Actions */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Drive Type Pill */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${meta.badgeClass}`}>
              <IconComponent className="w-3.5 h-3.5" />
              {meta.label}
            </span>

            {/* Category Pill */}
            {category && (
              <span 
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border"
                style={{
                  backgroundColor: `${categoryColor}15`,
                  color: categoryColor,
                  borderColor: `${categoryColor}30`,
                }}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full" 
                  style={{ backgroundColor: categoryColor }} 
                />
                {category.name}
              </span>
            )}
          </div>

          {/* Quick Item Actions (Edit / Delete) */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(item)}
              title="Edit Link"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(item)}
              title="Hapus Link"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors line-clamp-2 mb-1.5">
          {item.title}
        </h4>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* Tags */}
        {tagList.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mb-4 mt-2">
            {tagList.map((tag) => (
              <button
                key={tag.id || tag.name}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSelectTag) onSelectTag(tag);
                }}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 hover:bg-indigo-500/20 hover:text-indigo-300 border border-slate-700/50 transition-colors"
              >
                <TagIcon className="w-2.5 h-2.5 text-slate-400" />
                {tag.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata & Primary Action Buttons */}
      <div className="pt-3 border-t border-slate-800/60 mt-2">
        <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-slate-500" />
            {formatDate(item.createdAt)}
          </span>
          <span className="font-mono text-[11px] text-slate-500 truncate max-w-[120px]" title={item.url}>
            {item.url.replace(/^https?:\/\//, '')}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {/* Salin Link Button */}
          <button
            onClick={handleCopy}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold border transition-all ${
              copied
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:bg-slate-700/90 hover:text-white'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                Tersalin!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                Salin Link
              </>
            )}
          </button>

          {/* Buka Link Button */}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
          >
            Buka
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}

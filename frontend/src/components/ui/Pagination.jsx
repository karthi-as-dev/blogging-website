import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;

  const getPages = () => {
    const range = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(pages, page + delta); i++) {
      range.push(i);
    }
    if (range[0] > 1) { if (range[0] > 2) range.unshift('...'); range.unshift(1); }
    if (range[range.length - 1] < pages) { if (range[range.length - 1] < pages - 1) range.push('...'); range.push(pages); }
    return range;
  };

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
        className="btn-ghost p-2 disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronLeft size={18} />
      </button>

      {getPages().map((p, i) => (
        p === '...'
          ? <span key={i} className="text-gray-400 px-2">...</span>
          : <button key={i} onClick={() => onPageChange(p)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                p === page ? 'bg-primary-600 text-white' : 'btn-ghost'
              }`}>
              {p}
            </button>
      ))}

      <button onClick={() => onPageChange(page + 1)} disabled={page === pages}
        className="btn-ghost p-2 disabled:opacity-40 disabled:cursor-not-allowed">
        <ChevronRight size={18} />
      </button>
    </div>
  );
}

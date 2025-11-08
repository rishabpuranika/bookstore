import { Book } from '../types/database';
import { ShoppingCart, CheckCircle } from 'lucide-react';

interface BookCardProps {
  book: Book;
  isPurchased?: boolean;
  onPurchase?: (book: Book) => void;
  onView?: (book: Book) => void;
}

export function BookCard({ book, isPurchased, onPurchase, onView }: BookCardProps) {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition group">
      <div className="aspect-[3/4] bg-gradient-to-br from-slate-200 to-slate-300 relative overflow-hidden">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-4xl font-bold text-slate-400">{book.title[0]}</span>
          </div>
        )}
        {isPurchased && (
          <div className="absolute top-3 right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            Owned
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-900 mb-1 line-clamp-1">{book.title}</h3>
        <p className="text-sm text-gray-600 mb-3">{book.author}</p>

        {book.description && (
          <p className="text-sm text-gray-500 mb-4 line-clamp-2">{book.description}</p>
        )}

        {book.genre && (
          <span className="inline-block px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-full mb-4">
            {book.genre}
          </span>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <span className="text-2xl font-bold text-gray-900">${book.price.toFixed(2)}</span>

          {isPurchased ? (
            <button
              onClick={() => onView?.(book)}
              className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition font-medium text-sm"
            >
              Read Now
            </button>
          ) : (
            <button
              onClick={() => onPurchase?.(book)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium text-sm flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

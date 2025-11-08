import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Book, Purchase } from '../types/database';
import { useAuth } from '../contexts/AuthContext';
import { BookCard } from './BookCard';
import { Search, Filter, LogOut, Upload, Library } from 'lucide-react';

export function BookStore() {
  const { signOut, profile } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [view, setView] = useState<'store' | 'library' | 'upload'>('store');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBooks();
    loadPurchases();
  }, []);

  const loadBooks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setBooks(data);
    }
    setLoading(false);
  };

  const loadPurchases = async () => {
    const { data } = await supabase
      .from('purchases')
      .select('*');

    if (data) {
      setPurchases(data);
    }
  };

  const handlePurchase = async (book: Book) => {
    if (!profile) return;

    const alreadyPurchased = purchases.some(p => p.book_id === book.id);
    if (alreadyPurchased) {
      alert('You already own this book!');
      return;
    }

    const confirmed = confirm(`Purchase "${book.title}" for $${book.price.toFixed(2)}?`);
    if (!confirmed) return;

    const { error } = await supabase.from('purchases').insert({
      user_id: profile.id,
      book_id: book.id,
      amount_paid: book.price
    });

    if (error) {
      alert('Purchase failed: ' + error.message);
    } else {
      alert('Purchase successful! Check your library.');
      loadPurchases();
    }
  };

  const handleViewBook = (book: Book) => {
    if (book.file_url) {
      window.open(book.file_url, '_blank');
    } else {
      alert('Book file not available');
    }
  };

  const filteredBooks = books.filter(book => {
    const matchesSearch = book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         book.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'all' || book.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  const purchasedBooks = books.filter(book =>
    purchases.some(p => p.book_id === book.id)
  );

  const genres = Array.from(new Set(books.map(b => b.genre).filter(Boolean)));

  const canUpload = profile?.role === 'author' || profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">CloudBooks Store</h1>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {profile?.full_name || profile?.email}
              </span>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 transition"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <button
              onClick={() => setView('store')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                view === 'store' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Search className="w-4 h-4" />
              Browse Store
            </button>

            <button
              onClick={() => setView('library')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                view === 'library' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Library className="w-4 h-4" />
              My Library ({purchasedBooks.length})
            </button>

            {canUpload && (
              <button
                onClick={() => setView('upload')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                  view === 'upload' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Upload className="w-4 h-4" />
                Upload Book
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {view === 'store' && (
          <>
            <div className="mb-8 flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search books by title or author..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="relative">
                <Filter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white min-w-[200px]"
                >
                  <option value="all">All Genres</option>
                  {genres.map(genre => (
                    <option key={genre} value={genre}>{genre}</option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredBooks.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No books found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredBooks.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isPurchased={purchases.some(p => p.book_id === book.id)}
                    onPurchase={handlePurchase}
                    onView={handleViewBook}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'library' && (
          <>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">My Library</h2>
            {purchasedBooks.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <Library className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-2">Your library is empty</p>
                <p className="text-gray-400 mb-6">Start browsing the store to add books</p>
                <button
                  onClick={() => setView('store')}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Browse Store
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {purchasedBooks.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isPurchased={true}
                    onView={handleViewBook}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {view === 'upload' && canUpload && (
          <UploadBookForm onSuccess={loadBooks} />
        )}
      </main>
    </div>
  );
}

function UploadBookForm({ onSuccess }: { onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
    price: '',
    genre: '',
    cover_url: '',
    file_url: '',
    published_date: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('books').insert({
      ...formData,
      price: parseFloat(formData.price)
    });

    if (error) {
      alert('Upload failed: ' + error.message);
    } else {
      alert('Book uploaded successfully!');
      setFormData({
        title: '',
        author: '',
        description: '',
        price: '',
        genre: '',
        cover_url: '',
        file_url: '',
        published_date: ''
      });
      onSuccess();
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Upload New Book</h2>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Author *</label>
          <input
            type="text"
            required
            value={formData.author}
            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
            <input
              type="text"
              value={formData.genre}
              onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cover URL</label>
          <input
            type="url"
            value={formData.cover_url}
            onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/cover.jpg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">File URL</label>
          <input
            type="url"
            value={formData.file_url}
            onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://example.com/book.pdf"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Published Date</label>
          <input
            type="date"
            value={formData.published_date}
            onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Book'}
        </button>
      </form>
    </div>
  );
}

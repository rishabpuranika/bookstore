import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { BookStore } from './components/BookStore';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? <BookStore /> : <Auth />;
}

export default App;

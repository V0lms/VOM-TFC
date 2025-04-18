import React, { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Calendar, MapPin, StickyNote } from 'lucide-react';

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface ImageItem {
  id: string;
  base64: string;
  createdAt: string;
}

function App() {
  const [activeTab, setActiveTab] = useState<'notes' | 'photos' | 'calendar' | 'map'>('notes');
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [images, setImages] = useState<ImageItem[]>(() => {
    const saved = localStorage.getItem('images');
    return saved ? JSON.parse(saved) : [];
  });
  const [newNote, setNewNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [mapCenter, setMapCenter] = useState({ lat: 51.505, lng: -0.09 });

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('images', JSON.stringify(images));
  }, [images]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImages(prev => [...prev, {
          id: Date.now().toString(),
          base64: base64String,
          createdAt: new Date().toISOString()
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const addNote = () => {
    if (newNote.trim()) {
      setNotes(prev => [...prev, {
        id: Date.now().toString(),
        content: newNote,
        createdAt: new Date().toISOString()
      }]);
      setNewNote('');
    }
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('notes')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'notes'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <StickyNote className="w-5 h-5 mr-2" />
                Notes
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'photos'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Photos
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'calendar'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'map'
                    ? 'border-indigo-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <MapPin className="w-5 h-5 mr-2" />
                Map
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'notes' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Write a new note..."
                rows={3}
              />
              <button
                onClick={addNote}
                className="mt-2 bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600"
              >
                Add Note
              </button>
            </div>
            <div className="space-y-4">
              {notes.map(note => (
                <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-800">{note.content}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                    <button
                      onClick={() => deleteNote(note.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'photos' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <label className="block mb-2">
                <span className="sr-only">Choose photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-indigo-50 file:text-indigo-700
                    hover:file:bg-indigo-100"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map(img => (
                <div key={img.id} className="relative">
                  <img
                    src={img.base64}
                    alt="Uploaded"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => deleteImage(img.id)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <span className="sr-only">Delete</span>
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="bg-white rounded-lg shadow p-6">
            <input
              type="date"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
              className="border rounded-lg p-2"
            />
            <div className="mt-4">
              <h3 className="text-lg font-semibold">
                Selected Date: {selectedDate.toLocaleDateString()}
              </h3>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Map View (Placeholder)</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
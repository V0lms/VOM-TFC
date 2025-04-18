'use client';

import { useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, Calendar, MapPin, StickyNote, FolderPlus, Folder, Edit2, Trash2 } from 'lucide-react';

interface Album {
  id: string;
  name: string;
  createdAt: string;
}

interface Note {
  id: string;
  albumId: string;
  content: string;
  createdAt: string;
}

interface ImageItem {
  id: string;
  albumId: string;
  base64: string;
  createdAt: string;
}

interface MapLocation {
  id: string;
  albumId: string;
  url: string;
  name: string;
  createdAt: string;
}

export default function Home() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [newAlbumName, setNewAlbumName] = useState('');
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
  const [activeTab, setActiveTab] = useState<'notes' | 'photos' | 'calendar' | 'map'>('notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [locations, setLocations] = useState<MapLocation[]>([]);
  const [newNote, setNewNote] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [newMapUrl, setNewMapUrl] = useState('');
  const [newLocationName, setNewLocationName] = useState('');

  useEffect(() => {
    const savedAlbums = localStorage.getItem('albums');
    if (savedAlbums) {
      setAlbums(JSON.parse(savedAlbums));
    }
    
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }
    
    const savedImages = localStorage.getItem('images');
    if (savedImages) {
      setImages(JSON.parse(savedImages));
    }

    const savedLocations = localStorage.getItem('locations');
    if (savedLocations) {
      setLocations(JSON.parse(savedLocations));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('albums', JSON.stringify(albums));
  }, [albums]);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('images', JSON.stringify(images));
  }, [images]);

  useEffect(() => {
    localStorage.setItem('locations', JSON.stringify(locations));
  }, [locations]);

  const createAlbum = () => {
    if (newAlbumName.trim()) {
      const newAlbum: Album = {
        id: Date.now().toString(),
        name: newAlbumName,
        createdAt: new Date().toISOString()
      };
      setAlbums(prev => [...prev, newAlbum]);
      setNewAlbumName('');
      setIsCreatingAlbum(false);
    }
  };

  const deleteAlbum = (albumId: string) => {
    setAlbums(prev => prev.filter(album => album.id !== albumId));
    setNotes(prev => prev.filter(note => note.albumId !== albumId));
    setImages(prev => prev.filter(image => image.albumId !== albumId));
    setLocations(prev => prev.filter(location => location.albumId !== albumId));
    if (selectedAlbum?.id === albumId) {
      setSelectedAlbum(null);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedAlbum) return;
    
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImages(prev => [...prev, {
          id: Date.now().toString(),
          albumId: selectedAlbum.id,
          base64: base64String,
          createdAt: new Date().toISOString()
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  const addNote = () => {
    if (!selectedAlbum) return;
    
    if (newNote.trim()) {
      setNotes(prev => [...prev, {
        id: Date.now().toString(),
        albumId: selectedAlbum.id,
        content: newNote,
        createdAt: new Date().toISOString()
      }]);
      setNewNote('');
    }
  };

  const addLocation = () => {
    if (!selectedAlbum || !newMapUrl.trim() || !newLocationName.trim()) return;

    let embedUrl = newMapUrl;
    if (newMapUrl.includes('google.com/maps')) {
      // Convert share URL to embed URL
      embedUrl = newMapUrl.replace('google.com/maps', 'google.com/maps/embed');
    }

    setLocations(prev => [...prev, {
      id: Date.now().toString(),
      albumId: selectedAlbum.id,
      url: embedUrl,
      name: newLocationName,
      createdAt: new Date().toISOString()
    }]);
    setNewMapUrl('');
    setNewLocationName('');
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const deleteImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  const deleteLocation = (id: string) => {
    setLocations(prev => prev.filter(location => location.id !== id));
  };

  if (!selectedAlbum) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Mis Álbumes</h1>
            <button
              onClick={() => setIsCreatingAlbum(true)}
              className="bg-[#00cccc] text-white px-4 py-2 rounded-lg hover:bg-[#00b3b3] flex items-center"
            >
              <FolderPlus className="w-5 h-5 mr-2" />
              Crear Álbum
            </button>
          </div>

          {isCreatingAlbum && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow">
              <input
                type="text"
                value={newAlbumName}
                onChange={(e) => setNewAlbumName(e.target.value)}
                placeholder="Nombre del álbum"
                className="w-full p-2 border rounded-lg mb-4"
              />
              <div className="flex space-x-4">
                <button
                  onClick={createAlbum}
                  className="bg-[#00cccc] text-white px-4 py-2 rounded-lg hover:bg-[#00b3b3]"
                >
                  Guardar
                </button>
                <button
                  onClick={() => setIsCreatingAlbum(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map(album => (
              <div key={album.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <Folder className="w-6 h-6 text-[#00cccc] mr-3" />
                      <h2 className="text-xl font-semibold text-gray-900">{album.name}</h2>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setSelectedAlbum(album)}
                        className="text-[#00cccc] hover:text-[#00b3b3]"
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteAlbum(album.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    Creado el {new Date(album.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                  <div className="mt-4 flex space-x-2">
                    <div className="text-sm text-gray-600">
                      {notes.filter(note => note.albumId === album.id).length} notas
                    </div>
                    <div className="text-sm text-gray-600">
                      {images.filter(image => image.albumId === album.id).length} fotos
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAlbum(album)}
                  className="w-full bg-gray-50 py-3 text-[#00cccc] hover:bg-gray-100 transition-colors"
                >
                  Abrir Álbum
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setSelectedAlbum(null)}
                className="text-gray-500 hover:text-gray-700 mr-4"
              >
                ← Volver a Álbumes
              </button>
              <h1 className="text-xl font-semibold text-gray-900">{selectedAlbum.name}</h1>
            </div>
            <div className="flex space-x-8">
              <button
                onClick={() => setActiveTab('notes')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'notes'
                    ? 'border-[#00cccc] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <StickyNote className="w-5 h-5 mr-2" />
                Notas
              </button>
              <button
                onClick={() => setActiveTab('photos')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'photos'
                    ? 'border-[#00cccc] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <ImageIcon className="w-5 h-5 mr-2" />
                Fotos
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'calendar'
                    ? 'border-[#00cccc] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Calendario
              </button>
              <button
                onClick={() => setActiveTab('map')}
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  activeTab === 'map'
                    ? 'border-[#00cccc] text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                <MapPin className="w-5 h-5 mr-2" />
                Mapa
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'notes' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-4">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="w-full p-2 border rounded-lg"
                placeholder="Escribe una nueva nota..."
                rows={3}
              />
              <button
                onClick={addNote}
                className="mt-2 bg-[#00cccc] text-white px-4 py-2 rounded-lg hover:bg-[#00b3b3]"
              >
                Guardar
              </button>
            </div>
            <div className="space-y-4">
              {notes
                .filter(note => note.albumId === selectedAlbum.id)
                .map(note => (
                  <div key={note.id} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-800">{note.content}</p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {new Date(note.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <button
                        onClick={() => deleteNote(note.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
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
                <span className="sr-only">Subir</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-[#e6ffff] file:text-[#00cccc]
                    hover:file:bg-[#ccffff]"
                />
              </label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images
                .filter(img => img.albumId === selectedAlbum.id)
                .map(img => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.base64}
                      alt={`Imagen ${img.id}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => deleteImage(img.id)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <span className="sr-only">Eliminar</span>
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
                Fecha: {selectedDate.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
            </div>
          </div>
        )}

        {activeTab === 'map' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del lugar
                </label>
                <input
                  type="text"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder="Ej: Parque del Retiro"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de Google Maps
                </label>
                <input
                  type="text"
                  value={newMapUrl}
                  onChange={(e) => setNewMapUrl(e.target.value)}
                  placeholder="Pega aquí la URL de Google Maps"
                  className="w-full p-2 border rounded-lg"
                />
              </div>
              <button
                onClick={addLocation}
                className="bg-[#00cccc] text-white px-4 py-2 rounded-lg hover:bg-[#00b3b3]"
              >
                Agregar ubicación
              </button>
            </div>
            
            <div className="space-y-6">
              {locations
                .filter(location => location.albumId === selectedAlbum.id)
                .map(location => (
                  <div key={location.id} className="bg-gray-50 rounded-lg overflow-hidden">
                    <div className="p-4 flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
                      <button
                        onClick={() => deleteLocation(location.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Eliminar
                      </button>
                    </div>
                    <iframe
                      src={location.url}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full"
                    ></iframe>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
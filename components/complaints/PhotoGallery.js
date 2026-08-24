'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function PhotoGallery({ complaintId }) {
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadPhotos();
  }, [complaintId]);

  const loadPhotos = async () => {
    try {
      const { data: photoRecords } = await supabase
        .from('complaint_photos')
        .select('*')
        .eq('complaint_id', complaintId)
        .order('uploaded_at', { ascending: true });

      if (photoRecords && photoRecords.length > 0) {
        const photosWithUrls = await Promise.all(
          photoRecords.map(async (photo) => {
            const { data } = await supabase.storage
              .from('complaint-photos')
              .createSignedUrl(photo.storage_path, 3600); // 1 hour
            return { ...photo, url: data?.signedUrl };
          })
        );
        setPhotos(photosWithUrls.filter((p) => p.url));
      }
    } catch (err) {
      console.error('Error loading photos:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-sm text-text-muted py-4">Loading photos...</div>
    );
  }

  if (photos.length === 0) {
    return (
      <div className="text-sm text-text-muted py-4">No photos attached.</div>
    );
  }

  return (
    <>
      <div className="photo-grid">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="photo-thumb"
            onClick={() => setSelectedPhoto(photo)}
          >
            <img src={photo.url} alt="Complaint photo" loading="lazy" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedPhoto && (
        <div
          className="modal-backdrop"
          onClick={() => setSelectedPhoto(null)}
        >
          <div className="max-w-3xl w-full p-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedPhoto.url}
              alt="Complaint photo"
              className="w-full rounded-lg"
            />
            <button
              onClick={() => setSelectedPhoto(null)}
              className="btn-secondary mt-4 mx-auto block"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}

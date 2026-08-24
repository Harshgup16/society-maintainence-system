'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { CATEGORIES, PHOTO_LIMITS } from '@/lib/constants';

export default function ComplaintForm() {
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Camera Modal State
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const router = useRouter();
  const supabase = createClient();

  // Start Camera
  const startCamera = async () => {
    try {
      setError('');
      setShowCamera(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (camErr) {
      setError('Unable to access camera. Please allow camera permissions or upload an image file.');
      setShowCamera(false);
    }
  };

  // Attach stream when modal opens
  useEffect(() => {
    if (showCamera && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [showCamera, cameraStream]);

  // Stop Camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  // Capture Snapshot from Camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });

      if (photos.length >= PHOTO_LIMITS.maxFiles) {
        setError(`Maximum ${PHOTO_LIMITS.maxFiles} photos allowed`);
        stopCamera();
        return;
      }

      setPhotos((prev) => [...prev, file]);
      const dataUrl = canvas.toDataURL('image/jpeg');
      setPreviews((prev) => [...prev, dataUrl]);

      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (photos.length + files.length > PHOTO_LIMITS.maxFiles) {
      setError(`Maximum ${PHOTO_LIMITS.maxFiles} photos allowed`);
      return;
    }

    for (const file of files) {
      if (!PHOTO_LIMITS.allowedTypes.includes(file.type)) {
        setError('Only JPG, PNG, and WEBP images are allowed');
        return;
      }
      if (file.size > PHOTO_LIMITS.maxSizeBytes) {
        setError(`Each photo must be under ${PHOTO_LIMITS.maxSizeMB}MB`);
        return;
      }
    }

    setError('');
    setPhotos((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews((prev) => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!category) throw new Error('Please select a category');
      if (description.length < 10) throw new Error('Description must be at least 10 characters');

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in');

      // 1. Create complaint
      const { data: complaint, error: createError } = await supabase
        .from('complaints')
        .insert({
          resident_id: user.id,
          category,
          description,
          status: 'open',
          priority: 'medium',
          is_overdue: false,
        })
        .select()
        .single();

      if (createError) throw createError;

      // 2. Upload photos
      for (const photo of photos) {
        const fileExt = photo.name.split('.').pop() || 'jpg';
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${complaint.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('complaint-photos')
          .upload(filePath, photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          continue;
        }

        await supabase.from('complaint_photos').insert({
          complaint_id: complaint.id,
          storage_path: filePath,
        });
      }

      // 3. History record
      await supabase.from('complaint_history').insert({
        complaint_id: complaint.id,
        changed_by: user.id,
        old_status: null,
        new_status: 'open',
        old_priority: null,
        new_priority: 'medium',
        note: 'Complaint created with supporting photo evidence',
      });

      router.push('/resident/dashboard');
      router.refresh();
    } catch (err) {
      setError(err.message || 'Failed to create complaint');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Category */}
      <div>
        <label className="input-label" htmlFor="complaint-category">
          Category *
        </label>
        <select
          id="complaint-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="input-editorial cursor-pointer"
          required
        >
          <option value="">Select a category</option>
          {CATEGORIES.map((cat) => (
            <option key={cat.value} value={cat.value}>
              {cat.label}
            </option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="input-label" htmlFor="complaint-description">
          Description *
        </label>
        <textarea
          id="complaint-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input-editorial min-h-[120px] resize-y"
          placeholder="Describe the maintenance issue in detail..."
          required
          minLength={10}
          maxLength={2000}
        />
        <p className="text-xs text-text-muted mt-1">
          {description.length}/2000 characters
        </p>
      </div>

      {/* Photo Upload & Camera Capture */}
      <div>
        <label className="input-label">
          Supporting Photos (optional, max {PHOTO_LIMITS.maxFiles})
        </label>

        {/* Previews */}
        {previews.length > 0 && (
          <div className="photo-grid mb-4">
            {previews.map((preview, index) => (
              <div key={index} className="photo-thumb relative group">
                <img src={preview} alt={`Preview ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 bg-dark text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < PHOTO_LIMITS.maxFiles && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload Dropzone */}
            <div
              className="dropzone flex flex-col items-center justify-center"
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.classList.add('active');
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('active');
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.currentTarget.classList.remove('active');
                const files = e.dataTransfer.files;
                if (files.length) {
                  handlePhotoChange({ target: { files } });
                }
              }}
            >
              <svg className="w-8 h-8 mb-2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 7.5l.75-.75M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125V16.5" />
              </svg>
              <p className="text-sm font-medium text-text-primary">
                Upload Image File
              </p>
              <p className="text-xs text-text-muted mt-1">
                Drag & drop or click to browse
              </p>
            </div>

            {/* Live Camera Button */}
            <div
              className="dropzone flex flex-col items-center justify-center border-accent/40 bg-amber-50/20 hover:bg-amber-50/50"
              onClick={startCamera}
            >
              <svg className="w-8 h-8 mb-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              <p className="text-sm font-medium text-text-primary">
                Take Photo with Camera
              </p>
              <p className="text-xs text-text-muted mt-1">
                Capture live photo evidence
              </p>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={PHOTO_LIMITS.allowedTypes.join(',')}
          multiple
          onChange={handlePhotoChange}
          className="hidden"
        />
      </div>

      {/* Camera Capture Modal */}
      {showCamera && (
        <div className="modal-backdrop">
          <div className="modal-content text-center">
            <h3 className="text-xl font-semibold mb-4 text-text-primary">
              Live Camera Capture
            </h3>
            <div className="relative rounded-2xl overflow-hidden bg-black aspect-video mb-6 border border-border">
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            </div>
            <canvas ref={canvasRef} className="hidden" />

            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                onClick={capturePhoto}
                className="btn-primary"
              >
                📸 Capture Snapshot
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={loading} className="btn-primary">
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Submitting...
          </span>
        ) : (
          'Submit Complaint'
        )}
      </button>
    </form>
  );
}

'use client';

import { useState, useRef } from 'react';
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
  const fileInputRef = useRef(null);
  const router = useRouter();
  const supabase = createClient();

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate
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

    // Create previews
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

      // 1. Create the complaint
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
        const fileExt = photo.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${complaint.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('complaint-photos')
          .upload(filePath, photo);

        if (uploadError) {
          console.error('Photo upload error:', uploadError);
          continue;
        }

        // Save photo reference
        await supabase.from('complaint_photos').insert({
          complaint_id: complaint.id,
          storage_path: filePath,
        });
      }

      // 3. Create initial history entry
      await supabase.from('complaint_history').insert({
        complaint_id: complaint.id,
        changed_by: user.id,
        old_status: null,
        new_status: 'open',
        old_priority: null,
        new_priority: 'medium',
        note: 'Complaint created',
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
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
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
          placeholder="Describe the issue in detail..."
          required
          minLength={10}
          maxLength={2000}
        />
        <p className="text-xs text-text-muted mt-1">
          {description.length}/2000 characters
        </p>
      </div>

      {/* Photo Upload */}
      <div>
        <label className="input-label">
          Photos (optional, max {PHOTO_LIMITS.maxFiles})
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
                  className="absolute top-1 right-1 w-6 h-6 bg-dark text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length < PHOTO_LIMITS.maxFiles && (
          <div
            className="dropzone"
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
            <svg className="w-8 h-8 mx-auto mb-2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M6.75 7.5l.75-.75M6.75 7.5H4.875c-.621 0-1.125.504-1.125 1.125v12c0 .621.504 1.125 1.125 1.125h14.25c.621 0 1.125-.504 1.125-1.125V16.5" />
            </svg>
            <p className="text-sm text-text-muted">
              Click or drag photos here
            </p>
            <p className="text-xs text-text-muted mt-1">
              JPG, PNG, WEBP · Max {PHOTO_LIMITS.maxSizeMB}MB each
            </p>
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

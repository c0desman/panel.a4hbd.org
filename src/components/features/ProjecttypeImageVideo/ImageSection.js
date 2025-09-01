// src/components/features/ProjecttypeImageVideo/ImageSection.js
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import ConfirmDialog from '@/components/features/popup/ConfirmDialog';
import { toast } from 'sonner';

export default function ImageSection({ projectTypeId }) {
  const [images, setImages] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingImageId, setEditingImageId] = useState(null);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, imageId: null });

  const fetchImages = async () => {
    if (!projectTypeId) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/images/projecttype/${projectTypeId}`,
        { credentials: 'include' }
      );
      const data = await res.json();
      if (res.ok) setImages(data.images || []);
      else {
        setImages([]);
        if (data.message) toast.error(data.message);
      }
    } catch {
      toast.error('Error fetching images');
    }
  };

  useEffect(() => {
    fetchImages();
  }, [projectTypeId]);

  const handleImageSubmit = async (formData, file, isEdit = false, imageId = null) => {
    try {
        const body = new FormData();
        body.append('title', formData.title);
        body.append('alt', formData.alt || '');
        body.append('description', formData.description || '');
        body.append('caption', formData.caption || '');
        // body.append('projectIds', null); // always null
        if (file) body.append('imagepath', file);

        // Append projectTypeIds correctly
        [projectTypeId].forEach(id => body.append('projectTypeIds', id));

        if (isEdit && imageId) body.append('id', imageId);

        const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}${isEdit ? '/editimage' : '/createimage'}`,
        { method: 'POST', credentials: 'include', body }
        );

        const data = await res.json();
        if (res.ok) {
        toast.success(data.message || (isEdit ? 'Image updated' : 'Image uploaded'));
        fetchImages(); // refresh image list
        } else {
        toast.error(data.message || 'Failed to save image');
        }
    } catch {
        toast.error('Error saving image');
    }
    };

  const handleRemove = async (imageId) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/removeimageprojecttype/${imageId}/${projectTypeId}`,
        { method: 'DELETE', credentials: 'include' }
      );
      if (res.ok) {
        toast.success('Image removed from this project type');
        fetchImages();
      } else toast.error('Failed to remove image');
    } catch {
      toast.error('Error removing image');
    }
    setConfirmDialog({ open: false, imageId: null });
  };

  const ImageForm = ({ image, onCancel }) => {
    const { register, handleSubmit, setValue, formState: { isSubmitting } } = useForm({
      defaultValues: {
        title: image?.title || '',
        alt: image?.alt || '',
        description: image?.description || '',
        caption: image?.caption || '',
      },
    });

    const [previewImage, setPreviewImage] = useState(
      image?.imagepath ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${image.imagepath.replace(/\\/g, '/')}` : null
    );
    const [selectedFile, setSelectedFile] = useState(null);

    const handleImageChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
        if (!image) {
          const autoTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          setValue('title', autoTitle);
          setValue('alt', autoTitle);
        }
      }
    };

    const onSubmit = (data) =>
      handleImageSubmit(data, selectedFile, !!image, image?.id).then(() => onCancel());

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded space-y-4 mb-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{image ? 'Edit Image' : 'Add New Image'}</h3>
          <Button type="button" size="icon" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Label>Image</Label>
          {previewImage && (
            <Image src={previewImage} alt="Preview" width={200} height={150} className="rounded mt-2 object-cover" />
          )}
          <Input type="file" accept="image/*" onChange={handleImageChange} disabled={isSubmitting} className="mt-2" />
        </div>

        <div>
          <Label>Title</Label>
          <Input {...register('title', { required: true })} disabled={isSubmitting} />
        </div>
        <div>
          <Label>Alt Text</Label>
          <Input {...register('alt')} disabled={isSubmitting} />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...register('description')} rows={2} disabled={isSubmitting} />
        </div>
        <div>
          <Label>Caption</Label>
          <Textarea {...register('caption')} rows={2} disabled={isSubmitting} />
        </div>

        <div className="flex gap-2 mt-4">
          <Button type="submit" className="flex-1 bg-green-600 text-white" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : image ? 'Save Changes' : 'Upload Image'}
          </Button>
          <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Image Section</h2>

      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white p-4 rounded shadow relative">
            {editingImageId === image.id ? (
              <ImageForm image={image} onCancel={() => setEditingImageId(null)} />
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold">{image.title}</h3>
                    <p className="text-sm text-gray-600">{image.alt}</p>
                    {image.description && <p className="text-sm mt-2">{image.description}</p>}
                    {image.caption && <p className="text-xs text-gray-500 italic">{image.caption}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Pencil className="cursor-pointer text-blue-500" onClick={() => setEditingImageId(image.id)} />
                    <Trash2
                      className="cursor-pointer text-red-500"
                      onClick={() => setConfirmDialog({ open: true, imageId: image.id })}
                    />
                  </div>
                </div>
                {image.imagepath && (
                  <Image
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${image.imagepath.replace(/\\/g, '/')}`}
                    alt={image.alt || 'Project Type Image'}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover rounded"
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      {showAddForm ? (
        <ImageForm onCancel={() => setShowAddForm(false)} />
      ) : (
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus /> Add Image
        </Button>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, imageId: null })}
        onConfirm={() => handleRemove(confirmDialog.imageId)}
        title="Remove image from this project type?"
        description="This will only remove the image from this project type, not delete it globally."
        confirmText="Yes, remove"
        cancelText="Cancel"
      />
    </div>
  );
}

//src/components/features/ImageVideoEdit/ImageSection.js
'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiSelect } from "@/components/ui/multi-select";
import ConfirmDialog from '@/components/features/popup/ConfirmDialog';

export default function ImageSection({ 
  images, 
  projectTypes, 
  projectId, 
  onImageSubmit, 
  onDeleteImage, 
  fetchImages, 
  editingImageId, 
  setEditingImageId 
}) {
  // const [editingImageId, setEditingImageId] = useState(null);
  const [showAddImageForm, setShowAddImageForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, imageId: null });

  // Image Form Component
  const ImageForm = ({ projectTypes, onSubmit, onCancel, image }) => {
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
    const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);

    // Initialize selected project types when editing
    useEffect(() => {
      if (image && image.projecttypes) {
        const initialProjectTypes = image.projecttypes.map(pt => ({
          value: pt.id.toString(),
          label: pt.title || `Project Type ${pt.id}`
        }));
        setSelectedProjectTypes(initialProjectTypes);
      }
    }, [image]);

    const getFileNameForTitle = (filename) => {
      return filename
        .replace(/\.[^/.]+$/, '')
        .replace(/[-_]/g, ' ')
        .replace(/\b\w/g, l => l.toUpperCase());
    };

    const handleImageChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        const objectURL = URL.createObjectURL(file);
        setPreviewImage(objectURL);
        
        if (!image) {
          const autoTitle = getFileNameForTitle(file.name);
          setValue('title', autoTitle);
          setValue('alt', autoTitle);
        }
      }
    };

    const handleFormSubmit = (data) => {
      onSubmit(data, selectedFile, selectedProjectTypes);
    };

    return (
      <form onSubmit={handleSubmit(handleFormSubmit)} className="bg-gray-50 p-4 rounded mb-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">{image ? 'Edit Image' : 'Add New Image'}</h3>
          <Button type="button" variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div>
          <Label>Image</Label>
          {previewImage && (
            <Image
              src={previewImage}
              alt="Preview"
              width={200}
              height={150}
              className="rounded mt-2 object-cover"
            />
          )}
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={isSubmitting}
            className="mt-2"
          />
        </div>

        <div>
          <Label>Title</Label>
          <Input
            {...register("title", { required: "Title is required" })}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label>Alt Text</Label>
          <Input
            {...register("alt", { required: "Alt text is required" })}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label>Description</Label>
          <Textarea
            {...register("description")}
            rows={3}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label>Caption</Label>
          <Textarea
            {...register("caption")}
            rows={2}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Label>Project Types</Label>
          <MultiSelect
            options={projectTypes.map(pt => ({
              value: pt.id.toString(),
              label: pt.title || `Project Type ${pt.id}`
            }))}
            value={selectedProjectTypes}
            onChange={setSelectedProjectTypes}
            placeholder="Select project types..."
            disabled={isSubmitting}
          />
        </div>

        <div className="flex gap-2 mt-6">
          <Button
            type="submit"
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : (image ? "Save Changes" : "Upload Image")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  };

  // Image Edit Form Component
  const ImageEditForm = ({ image, projectTypes, onSave, onCancel }) => {
    const { register, handleSubmit } = useForm({
      defaultValues: {
        title: image.title,
        alt: image.alt,
        description: image.description,
        caption: image.caption,
      },
    });

    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(
      image.imagepath ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${image.imagepath.replace(/\\/g, '/')}` : null
    );
    const [selectedProjectTypes, setSelectedProjectTypes] = useState([]);

    // Initialize selected project types when component mounts
    useEffect(() => {
      if (image && image.projecttypes) {
        const initialProjectTypes = image.projecttypes.map(pt => ({
          value: pt.id.toString(),
          label: pt.title || `Project Type ${pt.id}`
        }));
        setSelectedProjectTypes(initialProjectTypes);
      }
    }, [image]);

    const handleImageChange = (e) => {
      const file = e.target.files?.[0];
      if (file) {
        setSelectedFile(file);
        setPreviewImage(URL.createObjectURL(file));
      }
    };

    const onSubmit = (data) => onSave(data, selectedFile, selectedProjectTypes);

    return (
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <Label>Image</Label>
          {previewImage && <Image src={previewImage} alt="Preview" width={150} height={100} className="rounded mt-2 object-cover" />}
          <Input type="file" accept="image/*" onChange={handleImageChange} className="mt-2" />
        </div>
        <div>
          <Label>Title</Label>
          <Input {...register('title')} placeholder="Title" />
        </div>
        <div>
          <Label>Alt Text</Label>
          <Input {...register('alt')} placeholder="Alt text" />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea {...register('description')} placeholder="Description" rows={2} />
        </div>
        <div>
          <Label>Caption</Label>
          <Textarea {...register('caption')} placeholder="Caption" rows={1} />
        </div>
        <div>
          <Label>Project Types</Label>
          <MultiSelect
            options={projectTypes.map(pt => ({
              value: pt.id.toString(),
              label: pt.title || `Project Type ${pt.id}`
            }))}
            value={selectedProjectTypes}
            onChange={setSelectedProjectTypes}
            placeholder="Select project types..."
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Update</Button>
        </div>
      </form>
    );
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-4">Images</h2>
      
      {/* Show existing images first */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        {images.map((image) => (
          <div key={image.id} className="bg-white p-4 rounded shadow relative">
            {editingImageId === image.id ? (
              <ImageEditForm 
                image={image} 
                projectTypes={projectTypes}
                onSave={async (data, file, selectedProjectTypes) => {
                  await onImageSubmit(data, file, selectedProjectTypes);
                  setEditingImageId(null);
                }} 
                onCancel={() => setEditingImageId(null)} 
              />
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{image.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{image.alt}</p>
                    {image.description && <p className="text-sm mt-2">{image.description}</p>}
                    {image.caption && <p className="text-xs text-gray-500 mt-1 italic">{image.caption}</p>}
                    {/* Display associated project types */}
                    {image.projecttypes && image.projecttypes.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-blue-600">Project Types:</p>
                        <p className="text-xs text-gray-600">
                          {image.projecttypes.map(pt => pt.title || `Type ${pt.id}`).join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Pencil className="cursor-pointer text-blue-500" onClick={ () => {setEditingImageId(image.id); }} />
                    <Trash2 className="cursor-pointer text-red-500" onClick={() => setConfirmDialog({ open: true, imageId: image.id })} />
                  </div>
                </div>
                {image.imagepath && (
                  <Image 
                    src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${image.imagepath.replace(/\\/g, '/')}`} 
                    alt={image.alt || 'Project Image'} 
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

      {/* Add new image button */}
      <Button onClick={() => setShowAddImageForm(prev => !prev)} className="mb-4 flex items-center gap-2">
        <Plus /> Add New Image
      </Button>

      {showAddImageForm && (
        <ImageForm
          projectTypes={projectTypes}
          onSubmit={async (data, file, selectedProjectTypes) => {
            await onImageSubmit(data, file, selectedProjectTypes);
            setShowAddImageForm(false);
          }}
          onCancel={() => { setShowAddImageForm(false); }}
        />
      )}

      {/* Image Delete Confirmation */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, imageId: null })}
        onConfirm={async () => {
          await onDeleteImage(confirmDialog.imageId);
          fetchImages();
        }}
        title="Are you sure you want to remove this image?"
        description="This action will remove the image from this project but won't delete the image entirely."
        confirmText="Yes, remove"
        cancelText="Cancel"
      />
    </div>
  );
}
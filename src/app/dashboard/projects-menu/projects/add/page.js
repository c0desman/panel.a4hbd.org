'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import decodeHtml from '@/lib/decodeHtml';

export default function AddProjectPage() {
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [initiatives, setInitiatives] = useState([]);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isSlugManualEdit, setIsSlugManualEdit] = useState(false);

  // Watch the title field to auto-generate slug
  const titleValue = watch('title');
  
  useEffect(() => {
    async function fetchInitiatives() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allinitiative`, {
          withCredentials: true,
        });
        const decodedInitiatives = (res.data.data || []).map((item) => ({
          ...item,
          name: decodeHtml(item.name),
        }));
        setInitiatives(decodedInitiatives);
      } catch (err) {
        toast.error('Failed to load initiatives');
        console.error(err);
      }
    }

    fetchInitiatives();
  }, []);

  // Effect to auto-generate slug from title
  useEffect(() => {
    if (titleValue && !isSlugManualEdit) {
      const generatedSlug = titleValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      
      setValue('slug', generatedSlug);
    }
  }, [titleValue, isSlugManualEdit, setValue]);

  const handleMainImagePreview = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMainImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFilePreview = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image')) {
      const reader = new FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  const onSubmit = async (formDataFromReactHookForm, e) => {
    e.preventDefault(); // prevent default form action

    const formData = new FormData();

    const mainFile = e.target.main.files?.[0];
    const otherFile = e.target.files?.files?.[0];

    if (!mainFile) return toast.error("Main image is required.");
    if (!otherFile) return toast.error("Other file is required.");

    formData.append('main', mainFile);   // must match backend's multer field
    formData.append('files', otherFile); // must match backend's multer field

    formData.append('title', formDataFromReactHookForm.title || '');
    formData.append('slug', formDataFromReactHookForm.slug || '');
    formData.append('description', formDataFromReactHookForm.description || '');
    formData.append('videourl', formDataFromReactHookForm.videourl || '');
    formData.append('importance', formDataFromReactHookForm.importance || '');
    formData.append('whatwedo', formDataFromReactHookForm.whatwedo || '');
    formData.append('initiativeid', formDataFromReactHookForm.initiativeid || '');

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createproject`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success('Project created successfully');
      reset();
      setMainImagePreview(null);
      setFilePreview(null);
      setIsSlugManualEdit(false);
    } catch (error) {
      console.error(error?.response?.data || error.message);
      toast.error('Failed to create project');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Project</h1>
      <form onSubmit={handleSubmit((data, e) => onSubmit(data, e))} className="space-y-8">

        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} required className="bg-white mt-1" />
        </div>

        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input 
            id="slug" 
            {...register('slug')} 
            required 
            className="bg-white mt-1"
            onChange={() => setIsSlugManualEdit(true)}
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} rows={4} required className="bg-white mt-1" />
        </div>

        <div>
          <Label htmlFor="main">Main Image</Label>
          <Input 
            type="file" 
            id="main" 
            name="main"
            accept="image/*" 
            onChange={handleMainImagePreview}
            className="bg-white mt-1" 
          />
          {mainImagePreview && (
            <Image src={mainImagePreview} alt="Main Preview" width={400} height={250} className="mt-3 rounded object-cover" />
          )}
        </div>

        <div>
          <Label htmlFor="videourl">Main Video URL</Label>
          <Input id="videourl" {...register('videourl')} placeholder="https://youtube.com/..." className="bg-white mt-1" />
        </div>

        <div>
          <Label htmlFor="importance">Importance</Label>
          <Textarea id="importance" {...register('importance')} rows={3} className="bg-white mt-1" />
        </div>

        <div>
          <Label htmlFor="whatwedo">What We Do</Label>
          <Textarea id="whatwedo" {...register('whatwedo')} rows={3} className="bg-white mt-1" />
        </div>

        <div>
          <Label htmlFor="files">Upload File (Image/Video)</Label>
          <Input 
            type="file" 
            id="files" 
            name="files"
            accept="image/*,video/*" 
            onChange={handleFilePreview}
            className="bg-white mt-1" 
          />
          {filePreview && (
            <Image src={filePreview} alt="Media Preview" width={400} height={250} className="mt-3 rounded object-cover" />
          )}
        </div>

        <div>
          <Label htmlFor="initiativeid">Select Initiative</Label>
          <select id="initiativeid" {...register('initiativeid')} required className="bg-white mt-1 px-3 py-2 border rounded w-full">
            <option value="">-- Select Initiative --</option>
            {initiatives.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg">
            Create Project
          </Button>
        </div>

      </form>
    </div>
  );
}
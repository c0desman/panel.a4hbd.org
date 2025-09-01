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
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allinitiative`, { withCredentials: true });
        setInitiatives(res.data.data || []);
      } catch (err) {
        toast.error('Failed to load initiatives');
        console.error(err);
      }
    }
    fetchInitiatives();
  }, []);

  useEffect(() => {
    if (titleValue && !isSlugManualEdit) {
      const generatedSlug = titleValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      
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

  const onSubmit = async (data, e) => {
    e.preventDefault();

    const formData = new FormData();

    const mainFile = e.target.main.files?.[0];
    const otherFile = e.target.files?.files?.[0];

    if (!mainFile) return toast.error("Main image is required.");
    if (!otherFile) return toast.error("Other file is required.");

    formData.append('main', mainFile);
    formData.append('files', otherFile);

    // Append raw HTML from textareas
    formData.append('title', data.title || '');
    formData.append('slug', data.slug || '');
    formData.append('description', data.description || ''); // <-- raw HTML
    formData.append('importance', data.importance || '');   // <-- raw HTML
    formData.append('whatwedo', data.whatwedo || '');       // <-- raw HTML
    formData.append('videourl', data.videourl || '');
    formData.append('initiativeid', data.initiativeid || '');

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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

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
          <Label htmlFor="description">Description (supports HTML tags)</Label>
          <Textarea id="description" {...register('description')} rows={4} required className="bg-white mt-1" />
        </div>

        <div>
          <Label htmlFor="main">Main Image</Label>
          <Input type="file" id="main" name="main" accept="image/*" onChange={handleMainImagePreview} className="bg-white mt-1" />
          {mainImagePreview && <Image src={mainImagePreview} alt="Main Preview" width={400} height={250} className="mt-3 rounded object-cover" />}
        </div>

        <div>
          <Label htmlFor="videourl">Main Video URL</Label>
          <Input id="videourl" {...register('videourl')} placeholder="https://youtube.com/..." className="bg-white mt-1" />
        </div>

        <div>
          <Label htmlFor="importance">Importance (supports HTML tags)</Label>
          <Textarea id="importance" {...register('importance')} rows={3} className="bg-white mt-1" />
        </div>

        <div>
          <Label htmlFor="whatwedo">What We Do (supports HTML tags)</Label>
          <Textarea id="whatwedo" {...register('whatwedo')} rows={3} className="bg-white mt-1" />
        </div>

        <div>
          <Label htmlFor="files">Upload File (Image/Video)</Label>
          <Input type="file" id="files" name="files" accept="image/*,video/*" onChange={handleFilePreview} className="bg-white mt-1" />
          {filePreview && <Image src={filePreview} alt="Media Preview" width={400} height={250} className="mt-3 rounded object-cover" />}
        </div>

        <div>
          <Label htmlFor="initiativeid">Select Initiative</Label>
          <select id="initiativeid" {...register('initiativeid')} required className="bg-white mt-1 px-3 py-2 border rounded w-full">
            <option value="">-- Select Initiative --</option>
            {initiatives.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
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

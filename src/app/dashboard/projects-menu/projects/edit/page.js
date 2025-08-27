'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import decodeHtml from '@/lib/decodeHtml';

export default function EditProjectPage() {
  const { register, handleSubmit, setValue, control, watch } = useForm();
  const selectedInitiativeId = useWatch({ control, name: 'initiativeid' });
  const [initiatives, setInitiatives] = useState([]);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [previousInitiativeId, setPreviousInitiativeId] = useState(null);
  const [isSlugManualEdit, setIsSlugManualEdit] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const [storedInitiativeId, setStoredInitiativeId] = useState(''); // used to set after initiatives load

  // Watch the title field to auto-generate slug
  const titleValue = watch('title');
  
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

  // Load project and initiatives
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setProjectId(id);
      fetchProject(id);
    }
  }, [searchParams]);

  useEffect(() => {
    if (storedInitiativeId && initiatives.length > 0) {
      // Set after initiatives are loaded
      setValue('initiativeid', storedInitiativeId);
    }
  }, [storedInitiativeId, initiatives, setValue]);

  const fetchProject = async (id) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project/${id}`, {
        withCredentials: true,
      });

      const data = res.data.project;

      setValue('title', decodeHtml(data.title));
      setValue('slug', data.slug || '');
      setValue('description', decodeHtml(data.description));
      setValue('videourl', data.videourl || '');
      setValue('importance', decodeHtml(data.importance));
      setValue('whatwedo', decodeHtml(data.whatwedo));

      const initiativeId = data.initiatives?.[0]?.id?.toString() || '';
      setStoredInitiativeId(initiativeId);
      setPreviousInitiativeId(initiativeId);

      if (data.imagepath) {
        setMainImagePreview(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.imagepath.replace(/\\/g, '/')}`);
      }

      if (data.filepath) {
        setFilePreview(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.filepath.replace(/\\/g, '/')}`);
      }

      fetchInitiatives();
    } catch (err) {
      toast.error('Failed to load project data');
      console.error(err);
    }
  };

  const fetchInitiatives = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allinitiative`, {
        withCredentials: true,
      });
      setInitiatives(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load initiatives');
      console.error(err);
    }
  };

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

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('id', projectId);
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('description', data.description);
    formData.append('videourl', data.videourl);
    formData.append('importance', data.importance);
    formData.append('whatwedo', data.whatwedo);

    if (data.main && data.main[0]) {
      formData.append('main', data.main[0]);
    }

    if (data.files && data.files[0]) {
      formData.append('files', data.files[0]);
    }

    try {
      // Step 1: Update project base data
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/editproject`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      const newInitiativeId = data.initiativeid?.toString();

      // Step 2: Only if initiative changed, delete + re-add
      if (previousInitiativeId !== newInitiativeId) {
        if (previousInitiativeId) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteinitproject`,
            {
              projectid: projectId,
              initiativeid: previousInitiativeId,
            },
            { withCredentials: true }
          );
        }

        if (newInitiativeId) {
          await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/addinitiativeproject`,
            {
              projectid: projectId,
              initiativeid: newInitiativeId,
            },
            { withCredentials: true }
          );
        }
      }

      toast.success('Project updated successfully');
      router.push('/dashboard/projects-menu/projects/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update project');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Project</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} required className="bg-white mt-1" />
        </div>

        {/* Slug */}
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

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" {...register('description')} rows={4} required className="bg-white mt-1" />
        </div>

        {/* Main Image Upload */}
        <div>
          <Label htmlFor="main">Main Image</Label>
          <Input type="file" id="main" {...register('main')} accept="image/*" onChange={handleMainImagePreview} className="bg-white mt-1" />
          {mainImagePreview && (
            <Image src={mainImagePreview} alt="Main Preview" width={400} height={250} className="mt-3 rounded object-cover" />
          )}
        </div>

        {/* Video URL */}
        <div>
          <Label htmlFor="videourl">Main Video URL</Label>
          <Input id="videourl" {...register('videourl')} placeholder="https://youtube.com/..." className="bg-white mt-1" />
        </div>

        {/* Importance */}
        <div>
          <Label htmlFor="importance">Importance</Label>
          <Textarea id="importance" {...register('importance')} rows={3} className="bg-white mt-1" />
        </div>

        {/* What We Do */}
        <div>
          <Label htmlFor="whatwedo">What We Do</Label>
          <Textarea id="whatwedo" {...register('whatwedo')} rows={3} className="bg-white mt-1" />
        </div>

        {/* File Upload */}
        <div>
          <Label htmlFor="files">Upload File (Image/Video)</Label>
          <Input type="file" id="files" {...register('files')} accept="image/*,video/*" onChange={handleFilePreview} className="bg-white mt-1" />
          {filePreview && (
            <Image src={filePreview} alt="Media Preview" width={400} height={250} className="mt-3 rounded object-cover" />
          )}
        </div>

        {/* Initiative Dropdown */}
        <div>
          <Label htmlFor="initiativeid">Select Initiative</Label>
          <select
            id="initiativeid"
            {...register('initiativeid')}
            className="bg-white mt-1 px-3 py-2 border rounded w-full"
            required
          >
            <option value="">-- Select Initiative --</option>
            {initiatives.map((item) => (
              <option key={item.id} value={item.id.toString()}>
                {item.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div>
          <Button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg">
            Update Project
          </Button>
        </div>
      </form>
    </div>
  );
}
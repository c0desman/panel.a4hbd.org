'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { toast } from 'sonner';
import decodeHtml from '@/lib/decodeHtml';

export default function AddProjectTypePage() {
  const { register, handleSubmit, reset, watch, setValue } = useForm();
  const [projects, setProjects] = useState([]);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [isSlugManualEdit, setIsSlugManualEdit] = useState(false);

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

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojects`, {
          withCredentials: true,
        });
        const decodedProjects = (res.data.data || []).map((item) => ({
          ...item,
          title: decodeHtml(item.title),
        }));
        setProjects(decodedProjects);
      } catch (err) {
        toast.error('Failed to load projects');
        console.error(err);
      }
    }

    fetchProjects();
  }, []);

  const handleOgImagePreview = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOgImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formDataFromReactHookForm, e) => {
    e.preventDefault();

    const ogImageFile = e.target.ogimage.files?.[0];
    if (!ogImageFile) return toast.error('OG Image is required.');

    const formData = new FormData();

    formData.append('title', formDataFromReactHookForm.title || '');
    formData.append('slug', formDataFromReactHookForm.slug || '');
    formData.append('shortdescription', formDataFromReactHookForm.shortdescription || '');
    formData.append('longdescription', formDataFromReactHookForm.longdescription || '');
    formData.append('projectId', formDataFromReactHookForm.projectId || '');
    formData.append('seotitle', formDataFromReactHookForm.seotitle || '');
    formData.append('seodescription', formDataFromReactHookForm.seodescription || '');
    formData.append('seokeywords', formDataFromReactHookForm.seokeywords || '');
    formData.append('ogimage', ogImageFile);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createprojecttype`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success('Project type created successfully');
      reset();
      setOgImagePreview(null);
      setIsSlugManualEdit(false);
    } catch (error) {
      console.error(error?.response?.data || error.message);
      toast.error('Failed to create project type');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Create New Project Type</h1>
      <form onSubmit={handleSubmit((data, e) => onSubmit(data, e))} className="space-y-8">

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

        {/* Short Description (supports HTML) */}
        <div>
          <Label htmlFor="shortdescription">Short Description (supports HTML)</Label>
          <Textarea 
            id="shortdescription" 
            {...register('shortdescription')} 
            rows={3} 
            className="bg-white mt-1" 
            placeholder="You can use HTML tags like <b>bold</b> or <br>"
          />
        </div>

        {/* Long Description (supports HTML) */}
        <div>
          <Label htmlFor="longdescription">Long Description (supports HTML)</Label>
          <Textarea 
            id="longdescription" 
            {...register('longdescription')} 
            rows={4} 
            className="bg-white mt-1"
            placeholder="Supports HTML tags"
          />
        </div>

        {/* Select Project */}
        <div>
          <Label htmlFor="projectId">Select Project</Label>
          <select id="projectId" {...register('projectId')} required className="bg-white mt-1 px-3 py-2 border rounded w-full">
            <option value="">-- Select Project --</option>
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.title} (ID: {proj.id})
              </option>
            ))}
          </select>
        </div>

        {/* SEO Title */}
        <div>
          <Label htmlFor="seotitle">SEO Title</Label>
          <Input id="seotitle" {...register('seotitle')} className="bg-white mt-1" />
        </div>

        {/* SEO Description */}
        <div>
          <Label htmlFor="seodescription">SEO Description</Label>
          <Textarea id="seodescription" {...register('seodescription')} rows={3} className="bg-white mt-1" />
        </div>

        {/* SEO Keywords */}
        <div>
          <Label htmlFor="seokeywords">SEO Keywords</Label>
          <Input id="seokeywords" {...register('seokeywords')} placeholder="Comma separated (e.g. water, aid)" className="bg-white mt-1" />
        </div>

        {/* OG Image */}
        <div>
          <Label htmlFor="ogimage">OG Image</Label>
          <Input type="file" id="ogimage" name="ogimage" accept="image/*" onChange={handleOgImagePreview} className="bg-white mt-1" />
          {ogImagePreview && (
            <Image src={ogImagePreview} alt="OG Preview" width={400} height={250} className="mt-3 rounded object-cover" />
          )}
        </div>

        {/* Submit Button */}
        <div>
          <Button type="submit" className="w-full py-5 bg-green-600 hover:bg-green-700 text-white text-lg">
            Create Project Type
          </Button>
        </div>

      </form>
    </div>
  );
}
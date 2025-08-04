'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import decodeHtml from '@/lib/decodeHtml';

export default function EditProjectTypePage() {
  const { register, handleSubmit, setValue } = useForm();
  const [projects, setProjects] = useState([]);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [projectTypeId, setProjectTypeId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setProjectTypeId(id);
      fetchProjectType(id);
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
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
  };

  const fetchProjectType = async (id) => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projecttype/${id}`, {
        withCredentials: true,
      });
      
      const data = res.data.projectType;
      
      setValue('title', data.title || '');
      setValue('slug', data.slug || '');
      setValue('shortdescription', data.shortdescription || '');
      setValue('longdescription', data.longdescription || '');
      
      // Set project ID (using first project in the array)
      if (data.projects && data.projects.length > 0) {
        setValue('projectId', data.projects[0].id.toString());
      }
      
      // Set SEO fields
      if (data.seo) {
        setValue('seotitle', data.seo.title || '');
        setValue('seodescription', data.seo.description || '');
        setValue('seokeywords', data.seo.keywords || '');
        
        // Set OG image preview if exists
        if (data.seo.imagepath) {
          const imageUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.seo.imagepath.replace(/\\/g, '/')}`;
          setOgImagePreview(imageUrl);
        }
      }
      
      setIsLoading(false);
    } catch (err) {
      toast.error('Failed to load project type data');
      console.error(err);
      setIsLoading(false);
    }
  };

  const handleOgImagePreview = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setOgImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (formData, e) => {
    e.preventDefault();
    
    const formDataWithFile = new FormData();
    formDataWithFile.append('id', projectTypeId);
    formDataWithFile.append('title', formData.title || '');
    formDataWithFile.append('slug', formData.slug || '');
    formDataWithFile.append('shortdescription', formData.shortdescription || '');
    formDataWithFile.append('longdescription', formData.longdescription || '');
    formDataWithFile.append('projectId', formData.projectId || '');
    formDataWithFile.append('seotitle', formData.seotitle || '');
    formDataWithFile.append('seodescription', formData.seodescription || '');
    formDataWithFile.append('seokeywords', formData.seokeywords || '');

    const ogImageFile = e.target.ogimage.files?.[0];
    if (ogImageFile) {
      formDataWithFile.append('ogimage', ogImageFile);
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/editprojecttype`, formDataWithFile, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success('Project type updated successfully');
      router.push('/dashboard/projects-menu/project-type');
    } catch (error) {
      console.error(error?.response?.data || error.message);
      toast.error('Failed to update project type');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4 text-center">
        <p>Loading project type data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Project Type</h1>
      <form onSubmit={handleSubmit((data, e) => onSubmit(data, e))} className="space-y-8">

        {/* Title */}
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} required className="bg-white mt-1" />
        </div>

        {/* Slug */}
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register('slug')} required className="bg-white mt-1" />
        </div>

        {/* Short Description */}
        <div>
          <Label htmlFor="shortdescription">Short Description</Label>
          <Textarea id="shortdescription" {...register('shortdescription')} rows={3} className="bg-white mt-1" />
        </div>

        {/* Long Description */}
        <div>
          <Label htmlFor="longdescription">Long Description</Label>
          <Textarea id="longdescription" {...register('longdescription')} rows={4} className="bg-white mt-1" />
        </div>

        {/* Select Project */}
        <div>
          <Label htmlFor="projectId">Select Project</Label>
          <select 
            id="projectId" 
            {...register('projectId')} 
            required 
            className="bg-white mt-1 px-3 py-2 border rounded w-full"
          >
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
          <Input 
            id="seokeywords" 
            {...register('seokeywords')} 
            placeholder="Comma separated (e.g. water, aid)" 
            className="bg-white mt-1" 
          />
        </div>

        {/* OG Image */}
        <div>
          <Label htmlFor="ogimage">OG Image</Label>
          <Input 
            type="file" 
            id="ogimage" 
            name="ogimage" 
            accept="image/*" 
            onChange={handleOgImagePreview} 
            className="bg-white mt-1" 
          />
          {ogImagePreview && (
            <Image 
              src={ogImagePreview} 
              alt="OG Preview" 
              width={400} 
              height={250} 
              className="mt-3 rounded object-cover" 
            />
          )}
        </div>

        {/* Submit Button */}
        <div>
          <Button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg">
            Update Project Type
          </Button>
        </div>

      </form>
    </div>
  );
}
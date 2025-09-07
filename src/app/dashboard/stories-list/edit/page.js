'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function EditStoryPage() {
  const { register, handleSubmit, setValue, watch, reset, control } = useForm();
  const router = useRouter();
  const searchParams = useSearchParams();
  const storyId = searchParams.get('id');

  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [partners, setPartners] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const postTitle = watch('postTitle');

  // Slug generator
  useEffect(() => {
    if (postTitle) {
      const slug = postTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [postTitle, setValue]);

  // Fetch dropdown data
  useEffect(() => {
    const fetchDropdowns = async () => {
      try {
        const [projectRes, categoryRes, partnerRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojects`, { withCredentials: true }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allcatagories`, { withCredentials: true }),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allpartners`, { withCredentials: true }),
        ]);

        setProjects(projectRes.data.data || []);
        setCategories(categoryRes.data.data || []);
        setPartners(partnerRes.data.data || []);
      } catch (err) {
        toast.error('Failed to load dropdown data');
      }
    };

    fetchDropdowns();
  }, []);

  // Fetch story data after dropdowns are loaded
  useEffect(() => {
    if (storyId && projects.length && categories.length && partners.length) {
      fetchStoryData(storyId);
    }
  }, [storyId, projects, categories, partners]);

  const fetchStoryData = async (id) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/story/${id}`, {
        withCredentials: true,
      });

      const data = res.data.story;

      reset({
        postTitle: data.title,
        slug: data.slug,
        content: data.content,
        project: data.project?.id?.toString() || '',
        category: data.catagory?.id?.toString() || '',
        donor: data.partner?.id?.toString() || '',
        ogTitle: data.ogtitle,
        ogDescription: data.ogdescription,
        keywords: data.keywords,
      });

      if (data.imagepath) {
        setImagePreview(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.imagepath}`);
      }

      if (data.ogimagepath) {
        setOgImagePreview(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.ogimagepath}`);
      }
    } catch (err) {
      toast.error('Failed to load story data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      setValue('image', file);
    }
  };

  const handleOgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOgImagePreview(URL.createObjectURL(file));
      setValue('ogImage', file);
    }
  };

  const onSubmit = async (data) => {
    const formData = new FormData();
    formData.append('id', storyId);
    formData.append('title', data.postTitle);
    formData.append('slug', data.slug);
    formData.append('content', data.content);
    formData.append('projectId', data.project);
    formData.append('categoryId', data.category);
    formData.append('partnerId', data.donor);
    formData.append('ogtitle', data.ogTitle);
    formData.append('ogdescription', data.ogDescription);
    formData.append('keywords', data.keywords);

    if (data.image) formData.append('image', data.image);
    if (data.ogImage) formData.append('ogimage', data.ogImage);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/editstory`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success('Story updated successfully');
      router.push('/dashboard/stories-list/');
    } catch (error) {
      toast.error('Failed to update story');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex justify-center items-center h-64">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Story</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div>
          <Label>Post Title</Label>
          <Input {...register('postTitle', { required: true })} className="bg-white mt-1" />
        </div>

        {/* Slug */}
        <div>
          <Label>Slug</Label>
          <Input {...register('slug')} className="bg-white mt-1" />
        </div>

        {/* Selection Fields - Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Project */}
          <div>
            <Label>Project</Label>
            <select
              {...register('project')}
              className="bg-white w-full px-3 py-2 border rounded mt-1"
              defaultValue=""
            >
              <option value="">-- Select Project --</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id}>
                  {proj.title}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <Label>Category</Label>
            <select
              {...register('category')}
              className="bg-white w-full px-3 py-2 border rounded mt-1"
              defaultValue=""
            >
              <option value="">-- Select Category --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Donor / Partner */}
          <div>
            <Label>Donor</Label>
            <select
              {...register('donor')}
              className="bg-white w-full px-3 py-2 border rounded mt-1"
              defaultValue=""
            >
              <option value="">-- Select Donor --</option>
              {partners.map((donor) => (
                <option key={donor.id} value={donor.id}>
                  {donor.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Image */}
        <div>
          <Label>Main Image</Label>
          <Input type="file" accept="image/*" onChange={handleImageChange} className="bg-white mt-1" />
          {imagePreview && (
            <Image
              src={imagePreview}
              alt="Main Preview"
              width={300}
              height={200}
              className="mt-3 rounded object-cover"
            />
          )}
        </div>

        {/* Content */}
        <div>
          <Label>Content</Label>
          <Textarea
            {...register('content')}
            placeholder="Write the story here... (HTML tags like <b>, <br>, <i> are supported)"
            rows={8}
            className="bg-white mt-1 font-mono"
          />
        </div>

        {/* SEO Section */}
        <div className="border-t pt-6">
          <h2 className="text-lg font-semibold mb-4">SEO Details</h2>

          <div>
            <Label>OG Title</Label>
            <Input {...register('ogTitle')} className="bg-white mt-1" />
          </div>

          <div>
            <Label>OG Description</Label>
            <Textarea {...register('ogDescription')} rows={3} className="bg-white mt-1" />
          </div>

          <div>
            <Label>OG Image</Label>
            <Input type="file" accept="image/*" onChange={handleOgImageChange} className="bg-white mt-1" />
            {ogImagePreview && (
              <Image
                src={ogImagePreview}
                alt="OG Image"
                width={300}
                height={200}
                className="mt-3 rounded object-cover"
              />
            )}
          </div>

          <div>
            <Label>Keywords</Label>
            <Input
              {...register('keywords')}
              className="bg-white mt-1"
              placeholder="Comma separated keywords"
            />
          </div>
        </div>

        <Button type="submit" className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg">
          Update Story
        </Button>
      </form>
    </div>
  );
}
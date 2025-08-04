'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export default function AddStoryPage() {
  const router = useRouter();

  const [imagePreview, setImagePreview] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [partners, setPartners] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      postTitle: '',
      slug: '',
      project: '',
      category: '',
      donor: '',
      content: '',
      ogTitle: '',
      ogDescription: '',
      keywords: '',
    },
  });

  const postTitle = watch('postTitle');

  useEffect(() => {
    if (postTitle) {
      const generatedSlug = postTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug);
    }
  }, [postTitle, setValue]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [projectsRes, categoriesRes, partnersRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojects`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allcatagories`),
          axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allpartners`),
        ]);

        setProjects(projectsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
        setPartners(partnersRes.data.data || []);
      } catch (error) {
        toast.error('Failed to load dropdown data');
        console.error('Dropdown fetch error:', error);
      }
    };

    fetchOptions();
  }, []);

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
      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/createstory`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      toast.success('Story published successfully!');
      router.push('/dashboard/stories-list/');
    } catch (error) {
      toast.error('Failed to publish story');
      console.error('Story creation error:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-3">
      <h1 className="text-3xl font-bold mb-8 text-left">Create New Story</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <Label>Post Title</Label>
          <Input className="bg-white"
            {...register('postTitle', { required: true })}
            placeholder="Enter a descriptive title"
          />
          {errors.postTitle && (
            <p className="text-red-600 text-sm">Title is required.</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Slug</Label>
          <Input className="bg-white" {...register('slug', { required: true })} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select onValueChange={(val) => setValue('project', val)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent className="w-full bg-white">
                {projects.map((proj) => (
                  <SelectItem key={proj.id} value={proj.id.toString()}>
                    {proj.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select onValueChange={(val) => setValue('category', val)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="w-full bg-white">
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id.toString()}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Donors</Label>
            <Select onValueChange={(val) => setValue('donor', val)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Donor" />
              </SelectTrigger>
              <SelectContent className="w-full bg-white">
                {partners.map((don) => (
                  <SelectItem key={don.id} value={don.id.toString()}>
                    {don.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Upload Main Image</Label>
          <Input type="file" onChange={handleImageChange} />
          {imagePreview && (
            <div className="w-48 h-32 mt-2 relative rounded border shadow overflow-hidden">
              <Image
                src={imagePreview}
                alt="Preview"
                fill
                className="object-cover rounded"
              />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            {...register('content', { required: true })}
            placeholder="Write the story here..."
            rows={8}
            className="bg-white"
          />
          {errors.content && (
            <p className="text-red-600 text-sm">Content is required.</p>
          )}
        </div>

        <div className="pt-6 border-t">
          <h2 className="text-lg font-semibold mb-4">SEO Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>OG Title</Label>
              <Input className="bg-white" {...register('ogTitle')} />
            </div>
            <div className="space-y-2">
              <Label>OG Description</Label>
              <Textarea className="bg-white" {...register('ogDescription')} />
            </div>
            <div className="space-y-2">
              <Label>Upload OG Image</Label>
              <Input className="bg-white"
                type="file"
                accept="image/*"
                onChange={handleOgImageChange}
              />
              {ogImagePreview && (
                <div className="w-48 h-32 mt-2 relative rounded border shadow overflow-hidden">
                  <Image
                    src={ogImagePreview}
                    alt="OG Image Preview"
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input className="bg-white"
                {...register('keywords')}
                placeholder="Comma separated (e.g. aid, donation)"
              />
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 transition-colors"
        >
          Publish Story
        </Button>
      </form>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Embed from '@editorjs/embed';
import ImageTool from '@editorjs/image';
import Paragraph from '@editorjs/paragraph';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function EditPostPage() {
  const editorRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);

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
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      keywords: '',
    },
  });

  const postTitle = watch('postTitle');

  // Auto-generate slug
  useEffect(() => {
    if (postTitle) {
      const generatedSlug = postTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug);
    }
  }, [postTitle, setValue]);

  // Initialize EditorJS
  useEffect(() => {
    if (!editorRef.current) {
      editorRef.current = new EditorJS({
        holder: 'editorjs',
        tools: {
          header: Header,
          list: List,
          paragraph: Paragraph,
          embed: {
            class: Embed,
            inlineToolbar: true,
          },
          image: {
            class: ImageTool,
            config: {
              endpoints: {
                byFile: '/upload-image',
                byUrl: '/fetch-image',
              },
            },
          },
        },
        placeholder: 'Write your story content here...',
      });
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  // Preview uploaded image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Preview OG Image
  const handleOgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setOgImagePreview(URL.createObjectURL(file));
        setValue('ogImage', file); // Save the file itself in form state
    }
  };

  const onSubmit = async (data) => {
    const editor = editorRef.current;
    if (editor) {
      const output = await editor.save();
      data.content = output;
    }

    console.log('Submitted Data:', data);
    // send to API
  };

  const dummyProjects = ['Clean Water', 'Education Aid', 'Medical Mission'];
  const dummyCategories = ['Story', 'Update'];

  return (
    <div className="max-w-7xl mx-auto mt-3">
      <h1 className="text-3xl font-bold mb-8 text-left">Edit Story Post</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label>Post Title</Label>
          <Input
            placeholder="Enter a descriptive title"
            {...register('postTitle', { required: true })}
            className="transition-all focus:ring-2 focus:ring-blue-500 bg-white"
          />
          {errors.postTitle && <p className="text-red-600 text-sm">Title is required.</p>}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input
            {...register('slug', { required: true })}
            className="transition-all focus:ring-2 focus:ring-blue-500  bg-white"
          />
        </div>

        {/* Project and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Project</Label>
            <Select className="w-full" onValueChange={(val) => setValue('project', val)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Project" />
              </SelectTrigger>
              <SelectContent>
                {dummyProjects.map((proj) => (
                  <SelectItem key={proj} value={proj}>
                    {proj}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.project && <p className="text-red-600 text-sm">Project is required.</p>}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select className="" onValueChange={(val) => setValue('category', val)}>
              <SelectTrigger className="w-full bg-white">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {dummyCategories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-600 text-sm">Category is required.</p>}
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-2">
          <Label>Upload Image</Label>
          <Input type="file" onChange={handleImageChange} />
          {imagePreview && (
            <div className="w-48 h-32 mt-2 relative rounded border shadow overflow-hidden">
                <Image
                    src={imagePreview}
                    alt="Preview"
                    fill
                    className="object-cover rounded"
                    sizes="192px"
                />
            </div>
          )}
        </div>

        {/* EditorJS */}
        <div>
          <Label className="mb-2 block">Content</Label>
          <div id="editorjs" className="min-h-[300px] border rounded-md p-4 shadow-sm bg-white" />
        </div>

        {/* SEO Section */}
        <div className="pt-6 border-t">
          <h2 className="text-lg font-semibold mb-4">SEO Details</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>OG Title</Label>
              <Input className="bg-white" {...register('ogTitle')} />
            </div>

            <div className="space-y-2">
              <Label>OG Description</Label>
              <Textarea {...register('ogDescription')} />
            </div>

            <div className="space-y-2">
                <Label>Upload OG Image</Label>
                <Input type="file" accept="image/*" onChange={handleOgImageChange} />
                {ogImagePreview && (
                    <div className="w-48 h-32 mt-2 relative rounded border shadow overflow-hidden">
                    <Image
                        src={ogImagePreview}
                        alt="OG Image Preview"
                        fill
                        className="object-cover rounded"
                        sizes="192px"
                    />
                    </div>
                )}
            </div>

            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input className="bg-white" {...register('keywords')} placeholder="Comma separated (e.g. aid, donation)" />
            </div>
          </div>
        </div>

        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors">
          Save Changes
        </Button>
      </form>
    </div>
  );
}

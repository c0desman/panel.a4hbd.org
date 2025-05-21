'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import Image from 'next/image';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function EditStoryPage() {
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
      postTitle: 'Helping Rural Villages',
      slug: 'helping-rural-villages',
      project: 'Clean Water',
      category: 'Story',
      ogTitle: 'How We Helped',
      ogDescription: 'Learn how we transformed a community.',
      ogImage: '',
      keywords: 'aid, clean water, rural',
    },
  });

  const postTitle = watch('postTitle');

  useEffect(() => {
    if (postTitle) {
      const generatedSlug = postTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug);
    }
  }, [postTitle, setValue]);

  // EditorJS initialization
  // This effect runs only on the client side
  useEffect(() => {
    if (typeof window === 'undefined') return; // Critical SSR check

    const initializeEditor = async () => {
      // Dynamically import EditorJS and tools
      const EditorJS = (await import('@editorjs/editorjs')).default;
      const Header = (await import('@editorjs/header')).default;
      const List = (await import('@editorjs/list')).default;
      const Embed = (await import('@editorjs/embed')).default;
      const ImageTool = (await import('@editorjs/image')).default;
      const Paragraph = (await import('@editorjs/paragraph')).default;

      if (!editorRef.current) {
        editorRef.current = new EditorJS({
          holder: 'editorjs',
          tools: {
            header: Header,
            list: List,
            paragraph: Paragraph,
            embed: { class: Embed, inlineToolbar: true },
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
    };

    initializeEditor();

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
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
    if (editorRef.current) {
      const output = await editorRef.current.save();
      data.content = output;
    }

    console.log('Edited Story Data:', data);
    // Send data to backend
  };

  const dummyProjects = ['Clean Water', 'Education Aid', 'Medical Mission'];
  const dummyCategories = ['Story', 'Update'];

  return (
    <div className="max-w-7xl mx-auto mt-3">
      <h1 className="text-3xl font-bold mb-8 text-left">Edit Story Post</h1>
      <StoryForm
        onSubmit={onSubmit}
        register={register}
        handleSubmit={handleSubmit}
        errors={errors}
        setValue={setValue}
        handleImageChange={handleImageChange}
        handleOgImageChange={handleOgImageChange}
        imagePreview={imagePreview}
        ogImagePreview={ogImagePreview}
        dummyProjects={dummyProjects}
        dummyCategories={dummyCategories}
      />
    </div>
  );
}

function StoryForm({
  onSubmit,
  register,
  handleSubmit,
  errors,
  setValue,
  handleImageChange,
  handleOgImageChange,
  imagePreview,
  ogImagePreview,
  dummyProjects,
  dummyCategories,
}) {
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-2">
        <Label>Post Title</Label>
        <Input className="bg-white" {...register('postTitle', { required: true })} placeholder="Enter a descriptive title" />
        {errors.postTitle && <p className="text-red-600 text-sm">Title is required.</p>}
      </div>

      <div className="space-y-2">
        <Label>Slug</Label>
        <Input className="bg-white" {...register('slug', { required: true })} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Project</Label>
          <Select onValueChange={(val) => setValue('project', val)}>
            <SelectTrigger className="w-full bg-white">
              <SelectValue placeholder="Select Project" />
            </SelectTrigger>
            <SelectContent className="w-full bg-white">
              {dummyProjects.map((proj) => (
                <SelectItem key={proj} value={proj}>
                  {proj}
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
              {dummyCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Upload Image</Label>
        <Input type="file" onChange={handleImageChange} />
        {imagePreview && (
          <div className="w-48 h-32 mt-2 relative rounded border shadow overflow-hidden">
            <Image src={imagePreview} alt="Preview" fill className="object-cover rounded" />
          </div>
        )}
      </div>

      <div>
        <Label>Content</Label>
        <div id="editorjs" className="min-h-[300px] border rounded-md p-4 shadow-sm bg-white" />
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
            <Input className="bg-white" type="file" accept="image/*" onChange={handleOgImageChange} />
            {ogImagePreview && (
              <div className="w-48 h-32 mt-2 relative rounded border shadow overflow-hidden">
                <Image src={ogImagePreview} alt="OG Image Preview" fill className="object-cover rounded" />
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
  );
}

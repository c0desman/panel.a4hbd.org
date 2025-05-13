'use client';

import { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
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

export default function AddProjectTypePage() {
  const editorRef = useRef(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      slug: '',
      shortDescription: '',
      selectedProjects: [],
      images: [{ file: null }],
      videos: [{ url: '' }],
      ogTitle: '',
      ogDescription: '',
      ogImage: '',
      keywords: '',
    },
  });

  const { fields: imageFields, append: appendImage, remove: removeImage } = useFieldArray({
    control,
    name: 'images',
  });

  const { fields: videoFields, append: appendVideo, remove: removeVideo } = useFieldArray({
    control,
    name: 'videos',
  });

  const title = watch('title');

  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', generatedSlug);
    }
  }, [title, setValue]);

  useEffect(() => {
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
        placeholder: 'Write your big description here...',
      });
    }

    return () => {
      if (editorRef.current?.destroy) {
        editorRef.current.destroy();
        editorRef.current = null;
      }
    };
  }, []);

  const handleOgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setOgImagePreview(URL.createObjectURL(file));
      setValue('ogImage', file);
    }
  };

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const previews = [...imagePreviews];
      previews[index] = URL.createObjectURL(file);
      setImagePreviews(previews);
      setValue(`images.${index}.file`, file);
    }
  };

  const onSubmit = async (data) => {
    if (editorRef.current) {
      const output = await editorRef.current.save();
      data.bigDescription = output;
    }

    console.log('New Project Type:', data);
    // Send data to backend
  };

  const dummyProjects = ['Clean Water', 'Education Aid', 'Medical Mission'];

  return (
    <div className="max-w-7xl mx-auto mt-3">
      <h1 className="text-3xl font-bold mb-8 text-left">Add New Project Type</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* Title */}
        <div className="space-y-2">
          <Label>Title</Label>
          <Input className="bg-white" {...register('title', { required: true })} placeholder="Enter project type title" />
          {errors.title && <p className="text-red-600 text-sm">Title is required.</p>}
        </div>

        {/* Slug */}
        <div className="space-y-2">
          <Label>Slug</Label>
          <Input className="bg-white" {...register('slug', { required: true })} />
        </div>

        {/* Multiple Project Selection */}
        <div className="space-y-2">
          <Label>Select Projects</Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {dummyProjects.map((proj) => (
              <label key={proj} className="flex items-center space-x-2">
                <input type="checkbox" value={proj} {...register('selectedProjects')} />
                <span>{proj}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Short Description */}
        <div className="space-y-2">
          <Label>Short Description</Label>
          <Textarea {...register('shortDescription')} rows={3} />
        </div>

        {/* Big Description */}
        <div>
          <Label className="mb-3">Big Description</Label>
          <div id="editorjs" className="min-h-[100px] border rounded-md p-4 shadow-sm bg-white" />
        </div>

        {/* Upload Images */}
        <div className="space-y-2">
          <Label>Upload Images</Label>
          {imageFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, index)} />
              {imagePreviews[index] && (
                <div className="w-24 h-16 relative border rounded overflow-hidden">
                  <Image src={imagePreviews[index]} alt="Preview" fill className="object-cover" />
                </div>
              )}
              {index > 0 && (
                <Button type="button" variant="destructive" onClick={() => {
                  removeImage(index);
                  const previews = [...imagePreviews];
                  previews.splice(index, 1);
                  setImagePreviews(previews);
                }}>-</Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={() => appendImage({ file: null })}>+ Add More Image</Button>
        </div>

        {/* Upload Videos (YouTube) */}
        <div className="space-y-2">
          <Label>YouTube Videos</Label>
          {videoFields.map((field, index) => (
            <div key={field.id} className="flex items-center space-x-2 mb-2">
              <Input {...register(`videos.${index}.url`, { required: index === 0 })} placeholder="Enter YouTube video URL" />
              {index > 0 && (
                <Button type="button" variant="destructive" onClick={() => removeVideo(index)}>-</Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={() => appendVideo({ url: '' })}>+ Add More Video</Button>
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
              <Label>OG Image</Label>
              <Input type="file" accept="image/*" onChange={handleOgImageChange} />
              {ogImagePreview && (
                <div className="w-48 h-32 mt-2 relative rounded border shadow overflow-hidden">
                  <Image src={ogImagePreview} alt="OG Preview" fill className="object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label>Keywords</Label>
              <Input className="bg-white" {...register('keywords')} placeholder="Comma separated (e.g. water, education)" />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">Create Project Type</Button>
      </form>
    </div>
  );
}

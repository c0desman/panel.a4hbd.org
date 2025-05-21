'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function EditCollaborationMessage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: 'Partner With Us',
      shortDescription: 'Join hands to expand our impact.',
      button1Name: 'Get Involved',
      button1Url: 'https://example.org/join',
      button2Name: 'Donate Now',
      button2Url: 'https://example.org/donate',
    },
  });

  const [mediaPreview, setMediaPreview] = useState(null);

  const handleMediaUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    console.log('Updated Collaboration Message:', data);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6">
      <h1 className="text-2xl font-bold mb-4">Edit Collaboration Message</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="mb-2">Title</Label>
          <Input {...register('title')} className="bg-white" />
        </div>
        <div>
          <Label className="mb-2">Short Description</Label>
          <Textarea {...register('shortDescription')} className="bg-white" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Button 1 Name</Label>
            <Input {...register('button1Name')} className="bg-white" />
            <Label className="mb-2 mt-3">Button 1 URL</Label>
            <Input {...register('button1Url')} className="bg-white" />
          </div>
          <div>
            <Label className="mb-2">Button 2 Name</Label>
            <Input {...register('button2Name')} className="bg-white" />
            <Label className="mb-2 mt-3">Button 2 URL</Label>
            <Input {...register('button2Url')} className="bg-white" />
          </div>
        </div>

        <div>
          <Label className="mb-2">Upload Image or Video</Label>
          <Input type="file" accept="image/*,video/*" onChange={handleMediaUpload} />
          {mediaPreview && (
            <div className="mt-2">
              <video controls className="w-full max-h-[300px] rounded" src={mediaPreview} />
            </div>
          )}
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}

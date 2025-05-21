'use client';

import { useForm } from 'react-hook-form';
import { useEffect } from 'react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function EditChairmanMessagePage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    defaultValues: {
      title: 'Message from the Chairman',
      smallDescription: 'A few words from our honorable chairman.',
      message: '',
      salutation: 'Warm regards,\nChairman, A4HBD',
    },
  });

  const onSubmit = (data) => {
    console.log('Chairman Message Submitted:', data);
    // You can send the data to your backend API here
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Edit Chairman Message</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label className="mb-2" htmlFor="title">Title</Label>
          <Input
            id="title"
            className="bg-white"
            placeholder="Enter the title"
            {...register('title', { required: 'Title is required' })}
          />
          {errors.title && (
            <p className="text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        {/* Small Description */}
        <div className="space-y-2">
          <Label className="mb-2" htmlFor="smallDescription">Small Description</Label>
          <Textarea
            id="smallDescription"
            className="bg-white"
            rows={3}
            placeholder="Enter a short description"
            {...register('smallDescription', { required: 'Description is required' })}
          />
          {errors.smallDescription && (
            <p className="text-sm text-red-600">{errors.smallDescription.message}</p>
          )}
        </div>

        {/* Message */}
        <div className="space-y-2">
          <Label className="mb-2" htmlFor="message">Message</Label>
          <Textarea
            id="message"
            className="bg-white"
            rows={8}
            placeholder="Write the chairman's message here"
            {...register('message', { required: 'Message is required' })}
          />
          {errors.message && (
            <p className="text-sm text-red-600">{errors.message.message}</p>
          )}
        </div>

        {/* Salutation */}
        <div className="space-y-2">
          <Label className="mb-2" htmlFor="salutation">Salutation</Label>
          <Textarea
            id="salutation"
            className="bg-white"
            rows={3}
            placeholder="Enter the salutation (e.g., Best regards)"
            {...register('salutation', { required: 'Salutation is required' })}
          />
          {errors.salutation && (
            <p className="text-sm text-red-600">{errors.salutation.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-colors">
          Save Changes
        </Button>
      </form>
    </div>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function EditOurStoriesPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '<h1>Stories That Inspire</h1>',
      shortDescription: 'Heartfelt experiences from the people we serve.',
    },
  });

  const onSubmit = (data) => {
    console.log('Updated Our Stories:', data);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Our Stories</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label className="mb-2">Title (HTML allowed)</Label>
          <Input {...register('title', { required: true })} className="bg-white" />
        </div>
        <div>
          <Label className="mb-2">Short Description</Label>
          <Textarea {...register('shortDescription')} className="bg-white" />
        </div>
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}

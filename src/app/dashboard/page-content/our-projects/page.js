'use client';

import { useForm } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function EditOurProjectsPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '<h1>Our Amazing Projects</h1>',
      shortDescription: 'These projects represent our commitment to positive change.',
    },
  });

  const onSubmit = (data) => {
    console.log('Updated Our Projects:', data);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Our Projects</h1>
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

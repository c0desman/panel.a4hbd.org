'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function EditContactUsPage() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '<h1>Contact Us</h1>',
      email: 'contact@example.org',
      phone: '+880123456789',
      cards: [
        { title: 'Help Desk', description: 'Reach out for immediate support.' },
        { title: 'Office', description: 'Visit our local branches.' },
        { title: 'Volunteer', description: 'Join us in making a difference.' },
      ],
      mapUrl: 'https://maps.google.com/xyz',
      locationTitle: '<h2>Our Location</h2>',
      locationMessage: 'We are located in the heart of Dhaka.',
      address: '123 Main Street',
      city: 'Dhaka',
      country: 'Bangladesh',
      faqs: [
        { question: 'How can I donate?', answer: 'Use the Donate Now button above.' },
      ],
      faqTitle: '<h2>Frequently Asked Questions</h2>',
      faqDescription: 'Here are answers to common questions.',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'faqs',
  });

  const onSubmit = (data) => {
    console.log('Updated Contact Us:', data);
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Contact Us</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <Label className="mb-2">Title</Label>
          <Input {...register('title')} className="bg-white" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Email</Label>
            <Input {...register('email')} className="bg-white" />
          </div>
          <div>
            <Label className="mb-2">Phone</Label>
            <Input {...register('phone')} className="bg-white" />
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold mt-4">Cards Section</h2>
          {[0, 1, 2].map((i) => (
            <div key={i} className="border p-4 rounded bg-gray-50 space-y-2">
              <Label className="mb-2">Card Title</Label>
              <Input {...register(`cards.${i}.title`)} className="bg-white" />
              <Label>Card Description</Label>
              <Textarea {...register(`cards.${i}.description`)} className="bg-white" />
            </div>
          ))}
        </div>

        <div>
          <Label className="mb-2">Google Map URL</Label>
          <Input {...register('mapUrl')} className="bg-white" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="mb-2">Location Title</Label>
            <Input {...register('locationTitle')} className="bg-white" />
          </div>
          <div>
            <Label className="mb-2">Location Message</Label>
            <Textarea {...register('locationMessage')} className="bg-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label className="mb-2">Address</Label>
            <Input {...register('address')} className="bg-white" />
          </div>
          <div>
            <Label className="mb-2">City</Label>
            <Input {...register('city')} className="bg-white" />
          </div>
          <div>
            <Label className="mb-2">Country</Label>
            <Input {...register('country')} className="bg-white" />
          </div>
        </div>

        <div className="border-t pt-6 space-y-4">
          <h2 className="text-lg font-semibold">FAQ Section</h2>
          <Label className="mb-2">FAQ Title</Label>
          <Input {...register('faqTitle')} className="bg-white" />
          <Label className="mb-2">FAQ Description</Label>
          <Textarea {...register('faqDescription')} className="bg-white" />

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="border rounded p-4 bg-gray-50">
                <Label className="mb-2">Question</Label>
                <Input {...register(`faqs.${index}.question`)} className="bg-white" />
                <Label className="mb-2">Answer</Label>
                <Textarea {...register(`faqs.${index}.answer`)} className="bg-white" />
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-2"
                  onClick={() => remove(index)}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" onClick={() => append({ question: '', answer: '' })}>
              + Add FAQ
            </Button>
          </div>
        </div>

        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}

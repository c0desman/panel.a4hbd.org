'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

export default function EditProjectPage() {
  const [mainImagePreview, setMainImagePreview] = useState(null);

  // Stable default values using useMemo
  const defaultValues = useMemo(() => ({
    title: 'Clean Water Initiative',
    shortDescription: 'Providing clean water in rural areas.',
    mainVideo: 'https://youtube.com/example',
    cards: [
      { number: '500', suffix: '+', text: 'Wells Built', icon: '🛠️' },
      { number: '10000', suffix: '+', text: 'People Helped', icon: '💧' },
    ],
    photoGallery: [{ file: null }, { file: null }],
    videoGallery: [
      { url: 'https://youtube.com/v1' },
      { url: 'https://youtube.com/v2' },
    ],
    faq: [
      { question: 'What is the goal?', answer: 'Provide clean water access.' },
      { question: 'How can I help?', answer: 'Donate or volunteer.' },
    ],
    whatWeDo: {
      description: 'We drill wells and purify water.',
      media: null,
    },
    ProjectImportance: {
      description: 'Access to water is a basic human right.',
      media: null,
    },
  }), []);

  const { register, handleSubmit, control, reset } = useForm({
    defaultValues,
  });

  const cardArray = useFieldArray({ control, name: 'cards' });
  const photoArray = useFieldArray({ control, name: 'photoGallery' });
  const videoArray = useFieldArray({ control, name: 'videoGallery' });
  const faqArray = useFieldArray({ control, name: 'faq' });

  useEffect(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const handleMainImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMainImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    console.log('Edited data:', data);
    // Submit update API call here
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-10">Edit Project</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* Project Title */}
        <div>
          <Label className="mb-2" htmlFor="title">Project Title</Label>
          <Input {...register('title')} className="bg-white" />
        </div>

        {/* Short Description */}
        <div>
          <Label className="mb-2" htmlFor="shortDescription">Short Description</Label>
          <Textarea {...register('shortDescription')} rows={3} className="bg-white" />
        </div>

        {/* Main Image & Video */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label className="mb-2" htmlFor="mainImage">Main Image</Label>
            <Input type="file" accept="image/*" onChange={handleMainImage} className="bg-white" />
            {mainImagePreview && (
              <div className="mt-4 border p-2 rounded">
                <Image src={mainImagePreview} alt="Main Preview" width={400} height={300} className="rounded object-cover w-full h-48" />
              </div>
            )}
          </div>
          <div>
            <Label className="mb-2" htmlFor="mainVideo">Main Video</Label>
            <Input {...register('mainVideo')} className="bg-white" />
          </div>
        </div>

        {/* Impact Cards */}
        <div>
          <Label className="mb-2">Impact Cards</Label>
          {cardArray.fields.map((field, index) => (
            <div key={field.id} className="mb-4 border p-4 rounded bg-gray-50">
              <div className="flex justify-between mb-3">
                <span>Card #{index + 1}</span>
                {index > 0 && (
                  <Button type="button" size="sm" variant="destructive" onClick={() => cardArray.remove(index)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Input {...register(`cards.${index}.number`)} placeholder="Number" className="bg-white" />
                <Input {...register(`cards.${index}.suffix`)} placeholder="Suffix" className="bg-white" />
                <Input {...register(`cards.${index}.text`)} placeholder="Text" className="bg-white" />
                <Input {...register(`cards.${index}.icon`)} placeholder="Icon" className="bg-white" />
              </div>
            </div>
          ))}
          <Button type="button" onClick={() => cardArray.append({ number: '', suffix: '', text: '', icon: '' })} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add Card
          </Button>
        </div>

        {/* Project Importance */}
        <div>
          <Label className="mb-2" htmlFor="ProjectImportanceDesc">Importance of the Project</Label>
          <Textarea {...register('ProjectImportance.description')} rows={4} className="bg-white" />
        </div>

        {/* What We Do */}
        <div className='bg-gray-50 p-4 rounded'>
          <Label className="mb-2" htmlFor="whatWeDoDesc">What We Do</Label>
          <div>
          <Textarea {...register('whatWeDo.description')} rows={4} className="bg-white" />
          <Label className="mb-2 block mt-4" htmlFor="whatWeDoMedia">Upload Media (Image/Video)</Label>
          <Input type="file" accept="image/*,video/*" {...register('whatWeDo.media')} className="bg-white" />
        </div>
        </div>

        {/* Photo Gallery */}
        <div>
          <Label className="mb-2">Photo Gallery</Label>
          {photoArray.fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
              <Input type="file" accept="image/*" {...register(`photoGallery.${index}.file`)} className="bg-white" />
              {index > 0 && (
                <Button type="button" size="sm" variant="destructive" onClick={() => photoArray.remove(index)}>
                  <Minus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={() => photoArray.append({ file: null })} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add More Images
          </Button>
        </div>

        {/* Video Gallery */}
        <div>
          <Label className="mb-2">Video Gallery</Label>
          {videoArray.fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2 mb-2">
              <Input {...register(`videoGallery.${index}.url`)} placeholder="YouTube URL" className="bg-white" />
              {index > 0 && (
                <Button type="button" size="sm" variant="destructive" onClick={() => videoArray.remove(index)}>
                  <Minus className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
          <Button type="button" onClick={() => videoArray.append({ url: '' })} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add More Videos
          </Button>
        </div>

        {/* FAQs */}
        <div>
          <Label className="mb-2">FAQs</Label>
          {faqArray.fields.map((field, index) => (
            <div key={field.id} className="mb-4 border p-4 rounded bg-gray-50">
              <div className="flex justify-between mb-2">
                <span>FAQ #{index + 1}</span>
                {index > 0 && (
                  <Button type="button" size="sm" variant="destructive" onClick={() => faqArray.remove(index)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Input {...register(`faq.${index}.question`)} placeholder="Question" className="bg-white mb-2" />
              <Textarea {...register(`faq.${index}.answer`)} rows={2} placeholder="Answer" className="bg-white" />
            </div>
          ))}
          <Button type="button" onClick={() => faqArray.append({ question: '', answer: '' })} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </div>

        {/* Submit */}
        <div>
          <Button type="submit" className="w-full py-6 text-lg font-semibold bg-green-600 hover:bg-green-700">
            Update Project
          </Button>
        </div>
      </form>
    </div>
  );
}

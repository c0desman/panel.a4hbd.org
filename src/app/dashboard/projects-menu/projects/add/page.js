'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

export default function AddProjectPage() {
  const { register, handleSubmit, control } = useForm({
    defaultValues: {
      title: '',
      shortDescription: '',
      mainVideo: '',
      cards: [{ number: '', suffix: '', text: '', icon: '' }],
      photoGallery: [{ file: null }],
      videoGallery: [{ url: '' }],
      faq: [{ question: '', answer: '' }],
      whatWeDo: { description: '', media: null },
      ProjectImportance: { description: '', media: null }
    }
  });

  const cardArray = useFieldArray({ control, name: 'cards' });
  const photoArray = useFieldArray({ control, name: 'photoGallery' });
  const videoArray = useFieldArray({ control, name: 'videoGallery' });
  const faqArray = useFieldArray({ control, name: 'faq' });

  const [mainImagePreview, setMainImagePreview] = useState(null);

  const handleMainImage = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setMainImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    console.log(data);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-10">Add New Project</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* Project Title */}
        <div>
          <Label htmlFor="title" className="block mb-2 text-lg font-semibold">Project Title</Label>
          <Input
            id="title"
            {...register('title')}
            placeholder="Enter project title"
            className="bg-white"
          />
        </div>

        {/* Short Description */}
        <div>
          <Label htmlFor="shortDescription" className="block mb-2 text-lg font-semibold">Short Description</Label>
          <Textarea
            id="shortDescription"
            rows={3}
            {...register('shortDescription')}
            placeholder="Brief summary of the project..."
            className="bg-white"
          />
        </div>

        {/* Main Image & Video */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="mainImage" className="block mb-2 text-lg font-semibold">Main Image</Label>
            <Input type="file" id="mainImage" accept="image/*" onChange={handleMainImage} className="bg-white" />
            {mainImagePreview && (
              <div className="mt-4 border p-2 rounded">
                <Image
                  src={mainImagePreview}
                  alt="Main Preview"
                  width={400}
                  height={300}
                  className="rounded object-cover w-full h-48"
                />
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="mainVideo" className="block mb-2 text-lg font-semibold">Main Video</Label>
            <Input id="mainVideo" placeholder="https://youtube.com/..." {...register('mainVideo')} className="bg-white" />
          </div>
        </div>

        {/* Impact Cards */}
        <div>
          <Label className="block mb-4 text-lg font-semibold">Impact Cards (Min 2)</Label>
          {cardArray.fields.map((field, index) => (
            <div key={field.id} className="mb-4 border p-4 rounded-lg bg-gray-50">
              <div className="flex justify-between mb-3">
                <span className="text-sm font-medium">Card #{index + 1}</span>
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

        {/* Importance of the Project */}
        <div>
          <Label htmlFor="ProjectImportanceDesc" className="block mb-2 text-lg font-semibold">Importance of the Project</Label>
          <Textarea
            id="ProjectImportanceDesc"
            {...register('ProjectImportance.description')}
            placeholder="Describe why this project matters..."
            rows={4}
            className="bg-white"
          />
        </div>

        {/* What We Do */}
        <div>
          <Label htmlFor="whatWeDoDesc" className="block mb-2 text-lg font-semibold">What We Do</Label>
          <div className='p-4 bg-gray-50 rounded'>
            <Textarea
                id="whatWeDoDesc"
                {...register('whatWeDo.description')}
                placeholder="Describe what you do..."
                rows={4}
                className="bg-white"
            />
            <Label htmlFor="whatWeDoMedia" className="block mt-4 mb-2 text-base font-medium">Upload Media (Image/Video)</Label>
            <Input type="file" id="whatWeDoMedia" accept="image/*,video/*" {...register('whatWeDo.media')} className="bg-white" />
          </div>
        </div>

        {/* Photo Gallery */}
        <div>
          <Label className="block mb-4 text-lg font-semibold">Photo Gallery  (Min 4)</Label>
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
          <Label className="block mb-4 text-lg font-semibold">Video Gallery  (Min 4)</Label>
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

        {/* FAQ Section */}
        <div>
          <Label className="block mb-4 text-lg font-semibold">FAQs  (Min 3)</Label>
          {faqArray.fields.map((field, index) => (
            <div key={field.id} className="border p-4 rounded-lg bg-gray-50 mb-2">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">FAQ #{index + 1}</span>
                {index > 0 && (
                  <Button type="button" size="sm" variant="destructive" onClick={() => faqArray.remove(index)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>
              <Input {...register(`faq.${index}.question`)} placeholder="Question" className="bg-white mb-2" />
              <Textarea {...register(`faq.${index}.answer`)} placeholder="Answer" rows={2} className="bg-white" />
            </div>
          ))}
          <Button type="button" onClick={() => faqArray.append({ question: '', answer: '' })} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add FAQ
          </Button>
        </div>

        {/* Submit */}
        <div>
          <Button type="submit" className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700">
            Create Project
          </Button>
        </div>
      </form>
    </div>
  );
}

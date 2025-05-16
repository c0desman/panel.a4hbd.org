'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

export default function HomePageEditor() {
  const [heroPreview, setHeroPreview] = useState([]);
  const [backgroundPreview, setBackgroundPreview] = useState(null);

  const defaultValues = useMemo(() => ({
    heroSection: {
      title: '<h1>Welcome to Our Platform</h1>',
      description: 'Transforming communities through sustainable solutions',
      buttonText: 'Get Started',
      buttonUrl: '/signup',
      media: [{ file: null }, { file: null }],
      backgroundMedia: null
    },
    cardsSection: Array(4).fill({
      title: 'Feature',
      description: 'Description',
      icon: 'heart',
      iconColor: '#ffffff'
    }),
    aboutUs: {
      title: '<h2 style="color: #2d3748;">About Our Mission</h2>',
      description: 'Committed to creating lasting change',
      cards: [
        { title: 'Vision', description: 'Global sustainability', icon: 'eye', color: '#48bb78' },
        { title: 'Mission', description: 'Community empowerment', icon: 'target', color: '#4299e1' }
      ],
      buttonText: 'Learn More',
      buttonUrl: '/about',
      mainMedia: null
    },
    ourImpact: {
      title: '<h2>Our Achievements</h2>',
      description: 'Measuring our global impact',
      cards: Array(4).fill({
        number: '1000',
        suffix: '+',
        title: 'Projects',
        icon: 'check-circle',
        color: '#f6ad55'
      })
    },
    ourProjects: {
      title: '<h2>Featured Initiatives</h2>',
      description: 'Explore our ongoing projects',
      buttonText: 'View All',
      buttonUrl: '/projects',
      cards: Array(5).fill({
        title: 'Project',
        targetUrl: '',
        media: null
      })
    },
    seo: {
    ogTitle: 'Default OG Title',
    ogDescription: 'Default OG Description',
    ogImage: null,
    keywords: 'keyword1, keyword2'
    }
  }), []);

  const { register, handleSubmit, control, watch, setValue } = useForm({
    defaultValues
  });

  // Field arrays for dynamic sections
  const heroMediaArray = useFieldArray({ control, name: 'heroSection.media' });
  const cardsArray = useFieldArray({ control, name: 'cardsSection' });
  const impactArray = useFieldArray({ control, name: 'ourImpact.cards' });
  const projectsArray = useFieldArray({ control, name: 'ourProjects.cards' });
  const [ogImagePreview, setOgImagePreview] = useState(null);

  const handleFileUpload = (e, index, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...heroPreview];
        newPreviews[index] = reader.result;
        setHeroPreview(newPreviews);
      };
      reader.readAsDataURL(file);
      setValue(fieldName, file);
    }
  };

  const handleBackgroundUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBackgroundPreview(reader.result);
      reader.readAsDataURL(file);
      setValue('heroSection.backgroundMedia', file);
    }
  };

  const handleOgImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOgImagePreview(reader.result);
        setValue('seo.ogImage', file);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    console.log('Home Page Data:', data);
    // Submit logic here
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-10">Edit Home Page Content</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* Hero Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Hero Section</h2>
          
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Title (HTML)</Label>
              <Input {...register('heroSection.title')} rows={2} className="bg-white" />
            </div>

            <div>
              <Label className="mb-2">Description</Label>
              <Textarea {...register('heroSection.description')} rows={3} className="bg-white" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Button Text</Label>
                <Input {...register('heroSection.buttonText')} className="bg-white" />
              </div>
              <div>
                <Label className="mb-2">Button URL</Label>
                <Input {...register('heroSection.buttonUrl')} className="bg-white" />
              </div>
            </div>

            <div>
              <Label className="mb-2">Media Uploads (2 required)</Label>
              <div className="grid md:grid-cols-2 gap-4">
                {heroMediaArray.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e, index, `heroSection.media.${index}.file`)}
                      className="bg-white"
                    />
                    {heroPreview[index] && (
                      <Image
                        src={heroPreview[index]}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded object-cover"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="mb-2">Background Media</Label>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={handleBackgroundUpload}
                className="bg-white"
              />
              {backgroundPreview && (
                <Image
                  src={backgroundPreview}
                  alt="Background Preview"
                  width={400}
                  height={200}
                  className="mt-4 rounded object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Cards Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Feature Cards</h2>
          <div className="space-y-4">
            {cardsArray.fields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded bg-white">
                <div className="flex justify-between mb-3">
                  <span>Card #{index + 1}</span>
                  {index >= 4 && (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => cardsArray.remove(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid gap-4">
                  <Input {...register(`cardsSection.${index}.title`)} placeholder="Title" />
                  <Textarea
                    {...register(`cardsSection.${index}.description`)}
                    placeholder="Description"
                    rows={2}
                  />
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      {...register(`cardsSection.${index}.icon`)}
                      placeholder="Search icon (e.g. 'heart')"
                      onFocus={() => console.log('Show icon picker')}
                    />
                    <Input
                      type="color"
                      {...register(`cardsSection.${index}.iconColor`)}
                      className="w-full h-10"
                    />
                  </div>
                </div>
              </div>
            ))}
            <Button
              type="button"
              onClick={() => cardsArray.append({ title: '', description: '', icon: '', iconColor: '#ffffff' })}
              variant="outline"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </Button>
          </div>
        </div>

        {/* About Us Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">About Us Section</h2>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Title (CSS Supported)</Label>
              <Input {...register('aboutUs.title')} rows={2} className="bg-white" />
            </div>

            <div>
              <Label className="mb-2">Description</Label>
              <Textarea {...register('aboutUs.description')} rows={3} className="bg-white" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {watch('aboutUs.cards').map((card, index) => (
                <div key={index} className="border p-4 rounded bg-white">
                  <div className="space-y-4">
                    <Input {...register(`aboutUs.cards.${index}.title`)} placeholder="Title" />
                    <Textarea
                      {...register(`aboutUs.cards.${index}.description`)}
                      placeholder="Description"
                      rows={2}
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        {...register(`aboutUs.cards.${index}.icon`)}
                        placeholder="Search icon"
                      />
                      <Input
                        type="color"
                        {...register(`aboutUs.cards.${index}.color`)}
                        className="w-full h-10"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Button Text</Label>
                <Input {...register('aboutUs.buttonText')} className="bg-white" />
              </div>
              <div>
                <Label className="mb-2">Button URL</Label>
                <Input {...register('aboutUs.buttonUrl')} className="bg-white" />
              </div>
            </div>

            <div>
              <Label className="mb-2">Main Media Upload</Label>
              <Input
                type="file"
                accept="image/*,video/*"
                {...register('aboutUs.mainMedia')}
                className="bg-white"
              />
            </div>
          </div>
        </div>

        {/* Our Impact Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Our Impact Section</h2>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Title (HTML)</Label>
              <Input {...register('ourImpact.title')} rows={2} className="bg-white" />
            </div>

            <div>
              <Label className="mb-2">Description</Label>
              <Textarea {...register('ourImpact.description')} rows={3} className="bg-white" />
            </div>

            <div className="space-y-4">
              {impactArray.fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded bg-white">
                  <div className="flex justify-between mb-3">
                    <span>Impact Card #{index + 1}</span>
                    {index >= 4 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => impactArray.remove(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      {...register(`ourImpact.cards.${index}.number`)}
                      placeholder="Number"
                      className="bg-white"
                    />
                    <Input
                      {...register(`ourImpact.cards.${index}.suffix`)}
                      placeholder="Suffix (e.g., +, %) "
                      className="bg-white"
                    />
                    <Input
                      {...register(`ourImpact.cards.${index}.title`)}
                      placeholder="Title"
                      className="bg-white"
                    />
                    <div className="flex gap-2">
                      <Input
                        {...register(`ourImpact.cards.${index}.icon`)}
                        placeholder="Search icon"
                        onFocus={() => console.log('Show icon picker')}
                        className="bg-white flex-1"
                      />
                      <Input
                        type="color"
                        {...register(`ourImpact.cards.${index}.color`)}
                        className="w-16 h-10"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => impactArray.append({ number: '', suffix: '', title: '', icon: '', color: '#ffffff' })}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Impact Card
              </Button>
            </div>
          </div>
        </div>

        {/* Our Projects Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Our Projects Section</h2>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Title (HTML)</Label>
              <Input {...register('ourProjects.title')} rows={2} className="bg-white" />
            </div>

            <div>
              <Label className="mb-2">Description</Label>
              <Textarea {...register('ourProjects.description')} rows={3} className="bg-white" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Button Text</Label>
                <Input {...register('ourProjects.buttonText')} className="bg-white" />
              </div>
              <div>
                <Label className="mb-2">Button URL</Label>
                <Input {...register('ourProjects.buttonUrl')} className="bg-white" />
              </div>
            </div>

            <div className="space-y-4">
              {projectsArray.fields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded bg-white">
                  <div className="flex justify-between mb-3">
                    <span>Project Card #{index + 1}</span>
                    {index >= 5 && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => projectsArray.remove(index)}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-4">
                    <Input
                      {...register(`ourProjects.cards.${index}.title`)}
                      placeholder="Project Title"
                      className="bg-white"
                    />
                    {/* Added Target URL Input */}
                    <Input
                      {...register(`ourProjects.cards.${index}.targetUrl`)}
                      placeholder="Project URL"
                      className="bg-white"
                    />
                    <div>
                      <Label className="mb-2">Media Upload</Label>
                      <Input
                        type="file"
                        accept="image/*,video/*"
                        {...register(`ourProjects.cards.${index}.media`)}
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => projectsArray.append({ 
                  title: '', 
                  media: null,
                  targetUrl: '' 
                })}
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Project Card
              </Button>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">SEO Settings</h2>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">OG Title</Label>
              <Input 
                className="bg-white" 
                {...register('seo.ogTitle')} 
                placeholder="Open Graph Title"
              />
            </div>
            
            <div>
              <Label className="mb-2">OG Description</Label>
              <Textarea 
                {...register('seo.ogDescription')} 
                rows={3}
                className="bg-white"
                placeholder="Open Graph Description"
              />
            </div>
            
            <div>
              <Label className="mb-2">OG Image</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleOgImageChange}
                className="bg-white"
              />
              {ogImagePreview && (
                <div className="w-48 h-32 mt-2 relative rounded border shadow overflow-hidden">
                  <Image 
                    src={ogImagePreview} 
                    alt="OG Preview" 
                    fill 
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
              )}
            </div>
            
            <div>
              <Label className="mb-2">Keywords</Label>
              <Input 
                className="bg-white" 
                {...register('seo.keywords')} 
                placeholder="Comma-separated keywords"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              // Get all form values
              const formData = getValues();
              console.log('Complete Form Data:', {
                ...formData,
                // Include files if needed
                seo: {
                  ...formData.seo,
                  ogImage: formData.seo.ogImage?.name || 'No image selected'
                },
                heroSection: {
                  ...formData.heroSection,
                  media: formData.heroSection.media.map(m => m.file?.name || 'No file'),
                  backgroundMedia: formData.heroSection.backgroundMedia?.name || 'No background media'
                }
              });
            }}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
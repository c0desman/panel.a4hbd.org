// /src/app/dashboard/page-content/about-us/page.js
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

export default function AboutUsEditor() {
  const defaultValues = useMemo(() => ({
    titleSection: {
      title: '<h1>About Our Organization</h1>',
      description: 'Brief introduction about our work and mission'
    },
    slideSection: {
      slides: [{
        title: '',
        url: '',
        media: null
      }]
    },
    atGlanceSection: {
      title: 'At A Glance',
      description: 'Key facts and figures about our organization'
    },
    impactSection: Array(4).fill({
      title: 'Impact Area',
      description: 'How we create impact',
      image: null,
      bgColor: '#FFFFFF'
    }),
    visionSection: {
      title: 'Our Vision',
      description: 'Long-term vision statement',
      media: null
    },
    valuesSection: {
      title: 'Our Values',
      description: 'Core organizational values',
      media: null
    },
    missionSection: {
      title: 'Our Mission',
      description: 'Mission statement',
      media: null
    },
    objectivesSection: {
      title: 'Our Objectives',
      description: 'Strategic objectives',
      listDescription: '',
      background: null
    },
    timelineSection: {
      title: '<h2>Our Journey</h2>',
      description: 'Historical timeline of achievements',
      events: [{
        year: '',
        description: ''
      }]
    }
  }), []);

  const { register, handleSubmit, control, setValue } = useForm({ defaultValues });
  const { fields: slideFields, append: appendSlide, remove: removeSlide } = useFieldArray({ control, name: 'slideSection.slides' });
  const { fields: impactFields, append: appendImpact, remove: removeImpact } = useFieldArray({ control, name: 'impactSection' });
  const { fields: timelineFields, append: appendTimeline, remove: removeTimeline } = useFieldArray({ control, name: 'timelineSection.events' });

  const [slidePreviews, setSlidePreviews] = useState([]);
  const [impactPreviews, setImpactPreviews] = useState([]);
  const [visionPreview, setVisionPreview] = useState(null);
  const [valuesPreview, setValuesPreview] = useState(null);
  const [missionPreview, setMissionPreview] = useState(null);
  const [objectivesBgPreview, setObjectivesBgPreview] = useState(null);

  const handleMediaUpload = (e, fieldName, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => previewSetter(reader.result);
      reader.readAsDataURL(file);
      setValue(fieldName, file);
    }
  };

  const handleSlideImage = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...slidePreviews];
        newPreviews[index] = reader.result;
        setSlidePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
      setValue(`slideSection.slides.${index}.media`, file);
    }
  };

  const handleImpactImage = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...impactPreviews];
        newPreviews[index] = reader.result;
        setImpactPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
      setValue(`impactSection.${index}.image`, file);
    }
  };

  const onSubmit = (data) => {
    console.log('About Us Data:', data);
    // Submit logic here
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-10">Edit About Us Content</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* Title Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Title Section</h2>
          <div className="space-y-4">
            <Input {...register('titleSection.title')} className="bg-white" placeholder="Main Title" />
            <Textarea {...register('titleSection.description')} rows={3} className="bg-white" placeholder="Brief Description" />
          </div>
        </div>

        {/* Slide Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Slides</h2>
          <div className="space-y-4">
            {slideFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded bg-white">
                <div className="flex justify-between mb-3">
                  <span>Slide {index + 1}</span>
                  <Button variant="destructive" size="sm" onClick={() => removeSlide(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Input {...register(`slideSection.slides.${index}.title`)} placeholder="Slide Title" />
                  <Input {...register(`slideSection.slides.${index}.url`)} placeholder="URL" />
                  <div>
                    <Label className="mb-2">Media Upload (Image/Video)</Label>
                    <Input 
                      type="file" 
                      accept="image/*,video/*"
                      onChange={(e) => handleSlideImage(e, index)}
                      className="bg-white"
                    />
                    {slidePreviews[index] && (
                      <Image
                        src={slidePreviews[index]}
                        alt={`Slide Preview ${index + 1}`}
                        width={200}
                        height={120}
                        className="mt-2 rounded object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
            <Button type="button" onClick={() => appendSlide({ title: '', url: '', media: null })}>
              <Plus className="h-4 w-4 mr-2" /> Add Slide
            </Button>
          </div>
        </div>

        {/* At A Glance Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">At A Glance</h2>
          <div className="space-y-4">
            <Input {...register('atGlanceSection.title')} className="bg-white" placeholder="Section Title" />
            <Textarea {...register('atGlanceSection.description')} rows={4} className="bg-white" placeholder="Key Facts" />
          </div>
        </div>

        {/* Ideas to Impact Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Ideas to Impact</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {impactFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded bg-white">
                <div className="flex justify-between mb-3">
                  <span>Card {index + 1}</span>
                  {index >= 4 && (
                    <Button variant="destructive" size="sm" onClick={() => removeImpact(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <Input {...register(`impactSection.${index}.title`)} placeholder="Title" />
                  <Textarea {...register(`impactSection.${index}.description`)} rows={2} placeholder="Description" />
                  <Input 
                    type="color" 
                    {...register(`impactSection.${index}.bgColor`)} 
                    className="w-full h-10"
                  />
                  <div>
                    <Label className="mb-2">Image Upload</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleImpactImage(e, index)}
                      className="bg-white"
                    />
                    {impactPreviews[index] && (
                      <Image
                        src={impactPreviews[index]}
                        alt={`Impact Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="mt-2 rounded object-cover"
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Our Vision</h2>
          <div className="space-y-4">
            <Input {...register('visionSection.title')} className="bg-white" placeholder="Vision Title" />
            <Textarea {...register('visionSection.description')} rows={3} className="bg-white" placeholder="Vision Statement" />
            <div>
              <Label className="mb-2">Media Upload (Image/Video)</Label>
              <Input 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(e, 'visionSection.media', setVisionPreview)}
                className="bg-white"
              />
              {visionPreview && (
                <Image
                  src={visionPreview}
                  alt="Vision Preview"
                  width={300}
                  height={150}
                  className="mt-2 rounded object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Our Values</h2>
          <div className="space-y-4">
            <Input {...register('valuesSection.title')} className="bg-white" placeholder="Values Title" />
            <Textarea {...register('valuesSection.description')} rows={3} className="bg-white" placeholder="Core Values" />
            <div>
              <Label className="mb-2">Media Upload (Image/Video)</Label>
              <Input 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(e, 'valuesSection.media', setValuesPreview)}
                className="bg-white"
              />
              {valuesPreview && (
                <Image
                  src={valuesPreview}
                  alt="Values Preview"
                  width={300}
                  height={150}
                  className="mt-2 rounded object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Mission Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Our Mission</h2>
          <div className="space-y-4">
            <Input {...register('missionSection.title')} className="bg-white" placeholder="Mission Title" />
            <Textarea {...register('missionSection.description')} rows={3} className="bg-white" placeholder="Mission Statement" />
            <div>
              <Label className="mb-2">Media Upload (Image/Video)</Label>
              <Input 
                type="file" 
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(e, 'missionSection.media', setMissionPreview)}
                className="bg-white"
              />
              {missionPreview && (
                <Image
                  src={missionPreview}
                  alt="Mission Preview"
                  width={300}
                  height={150}
                  className="mt-2 rounded object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Objectives Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Our Objectives</h2>
          <div className="space-y-4">
            <Input {...register('objectivesSection.title')} className="bg-white" placeholder="Objectives Title" />
            <Textarea {...register('objectivesSection.description')} rows={2} className="bg-white" placeholder="Brief Description" />
            <Textarea 
              {...register('objectivesSection.listDescription')} 
              rows={4} 
              className="bg-white" 
              placeholder="List items (separate by new line)"
            />
            <div>
              <Label className="mb-2">Background Image</Label>
              <Input 
                type="file" 
                accept="image/*"
                onChange={(e) => handleMediaUpload(e, 'objectivesSection.background', setObjectivesBgPreview)}
                className="bg-white"
              />
              {objectivesBgPreview && (
                <Image
                  src={objectivesBgPreview}
                  alt="Background Preview"
                  width={300}
                  height={150}
                  className="mt-2 rounded object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Timeline</h2>
          <div className="space-y-4">
            <Input {...register('timelineSection.title')} className="bg-white" placeholder="Timeline Title" />
            <Textarea {...register('timelineSection.description')} rows={3} className="bg-white" placeholder="Timeline Description" />
            <div className="space-y-4">
              {timelineFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded bg-white">
                  <div className="flex justify-between mb-3">
                    <span>Event {index + 1}</span>
                    <Button variant="destructive" size="sm" onClick={() => removeTimeline(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Input {...register(`timelineSection.events.${index}.year`)} placeholder="Year" />
                    <Textarea
                      {...register(`timelineSection.events.${index}.description`)}
                      rows={2}
                      placeholder="Event Description"
                    />
                  </div>
                </div>
              ))}
              <Button type="button" onClick={() => appendTimeline({ year: '', description: '' })}>
                <Plus className="h-4 w-4 mr-2" /> Add Event
              </Button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <Button type="submit" className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700">
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
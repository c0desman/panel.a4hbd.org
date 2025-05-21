// /src/app/dashboard/page-content/how-we-work/page.js
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useEffect, useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function HowWeWorkEditor() {
  const defaultValues = useMemo(() => ({
    introSection: {
      title: '<h1>Our Working Methodology</h1>',
      description: 'Learn about our structured approach to creating impact'
    },
    procedureSection: Array(4).fill({
      title: 'Procedure Step',
      image: null,
      bgColor: '#FFFFFF',
      description: 'Step description'
    }),
    whereWeWork: {
      title: '<h2>Our Operational Areas</h2>',
      description: 'Regions where we actively work',
      media: null,
      areas: [{
        district: '',
        part: 'northeast',
        isOffice: false,
        isProjectArea: false
      }]
    },
    roadmapSection: {
      steps: [{
        stepNumber: 1,
        description: 'Implementation step details'
      }]
    },
    policySection: {
      description: 'Our organizational policies',
      policies: [{
        title: 'Policy Title',
        image: null,
        bgColor: '#FFFFFF'
      }]
    }
  }), []);

  const { register, handleSubmit, control, watch, setValue } = useForm({ defaultValues });
  const { fields: procedureFields, append: appendProcedure, remove: removeProcedure } = useFieldArray({ control, name: 'procedureSection' });
  const { fields: areaFields, append: appendArea, remove: removeArea } = useFieldArray({ control, name: 'whereWeWork.areas' });
  const { fields: stepFields, append: appendStep, remove: removeStep } = useFieldArray({ control, name: 'roadmapSection.steps' });
  const { fields: policyFields, append: appendPolicy, remove: removePolicy } = useFieldArray({ control, name: 'policySection.policies' });

  const [mediaPreview, setMediaPreview] = useState(null);
  const [procedurePreviews, setProcedurePreviews] = useState([]);
  const [policyPreviews, setPolicyPreviews] = useState([]);

  const handleMediaUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (fieldName === 'whereWeWork.media') {
          setMediaPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setValue(fieldName, file);
    }
  };

  const handleProcedureImage = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...procedurePreviews];
        newPreviews[index] = reader.result;
        setProcedurePreviews(newPreviews);
      };
      reader.readAsDataURL(file);
      setValue(`procedureSection.${index}.image`, file);
    }
  };

  const handlePolicyImage = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...policyPreviews];
        newPreviews[index] = reader.result;
        setPolicyPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
      setValue(`policySection.policies.${index}.image`, file);
    }
  };

  const onSubmit = (data) => {
    console.log('How We Work Data:', data);
    // Submit logic here
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-10">Edit How We Work Content</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* Intro Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Intro Section</h2>
          <div className="space-y-4">
            <div>
              <Label className="mb-2">Title (HTML Supported)</Label>
              <Input {...register('introSection.title')} className="bg-white" />
            </div>
            <div>
              <Label className="mb-2">Description</Label>
              <Textarea {...register('introSection.description')} rows={4} className="bg-white" />
            </div>
          </div>
        </div>

        {/* Procedure Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Procedure Section</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {procedureFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded bg-white">
                <div className="flex justify-between mb-3">
                  <span>Step {index + 1}</span>
                  {index >= 4 && (
                    <Button variant="destructive" size="sm" onClick={() => removeProcedure(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="space-y-4">
                  <Input {...register(`procedureSection.${index}.title`)} placeholder="Step Title" />
                  <div>
                    <Label className="mb-2">Background Color</Label>
                    <Input 
                      type="color" 
                      {...register(`procedureSection.${index}.bgColor`)} 
                      className="w-full h-10"
                    />
                  </div>
                  <div>
                    <Label className="mb-2">Image Upload</Label>
                    <Input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => handleProcedureImage(e, index)}
                      className="bg-white"
                    />
                    {procedurePreviews[index] && (
                      <Image
                        src={procedurePreviews[index]}
                        alt={`Preview ${index + 1}`}
                        width={100}
                        height={100}
                        className="mt-2 rounded object-cover"
                      />
                    )}
                  </div>
                  <Textarea
                    {...register(`procedureSection.${index}.description`)}
                    placeholder="Step Description"
                    rows={3}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Where We Work Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Where We Work</h2>
          <div className="space-y-4">
            <Input {...register('whereWeWork.title')} className="bg-white" placeholder="Section Title" />
            <Textarea {...register('whereWeWork.description')} rows={4} className="bg-white" placeholder="Section Description" />
            
            <div>
              <Label className="mb-2">Media Upload (Image/Video)</Label>
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(e, 'whereWeWork.media')}
                className="bg-white"
              />
              {mediaPreview && (
                <Image
                  src={mediaPreview}
                  alt="Media Preview"
                  width={300}
                  height={150}
                  className="mt-2 rounded object-cover"
                />
              )}
            </div>

            <div className="space-y-4">
              {areaFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded bg-white">
                  <div className="flex justify-between mb-3">
                    <span>Area {index + 1}</span>
                    <Button variant="destructive" size="sm" onClick={() => removeArea(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input {...register(`whereWeWork.areas.${index}.district`)} placeholder="District Name" />
                    <Select {...register(`whereWeWork.areas.${index}.part`)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Region" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="northeast">Northeast</SelectItem>
                        <SelectItem value="northwest">North West</SelectItem>
                        <SelectItem value="central">Central</SelectItem>
                        <SelectItem value="southeast">Southeast</SelectItem>
                        <SelectItem value="southwest">South West</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          {...register(`whereWeWork.areas.${index}.isOffice`)} 
                          className="h-4 w-4"
                        />
                        Office
                      </label>
                      <label className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          {...register(`whereWeWork.areas.${index}.isProjectArea`)} 
                          className="h-4 w-4"
                        />
                        Project Area
                      </label>
                    </div>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={() => appendArea({ district: '', part: 'northeast', isOffice: false, isProjectArea: false })}>
                <Plus className="h-4 w-4 mr-2" /> Add Area
              </Button>
            </div>
          </div>
        </div>

        {/* Roadmap Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Implementation Roadmap</h2>
          <div className="space-y-4">
            {stepFields.map((field, index) => (
              <div key={field.id} className="border p-4 rounded bg-white">
                <div className="flex justify-between mb-3">
                  <span>Step {index + 1}</span>
                  <Button variant="destructive" size="sm" onClick={() => removeStep(index)}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Input 
                    value={index + 1}
                    disabled
                    placeholder="Step Number"
                    className="bg-gray-100"
                  />
                  <Textarea
                    {...register(`roadmapSection.steps.${index}.description`)}
                    placeholder="Step Description"
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <Button type="button" onClick={() => appendStep({ stepNumber: stepFields.length + 1, description: '' })}>
              <Plus className="h-4 w-4 mr-2" /> Add Step
            </Button>
          </div>
        </div>

        {/* Policy Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Our Policies</h2>
          <div className="space-y-4">
            <Textarea {...register('policySection.description')} rows={4} className="bg-white" placeholder="Policy Section Description" />
            
            <div className="grid md:grid-cols-2 gap-4">
              {policyFields.map((field, index) => (
                <div key={field.id} className="border p-4 rounded bg-white">
                  <div className="flex justify-between mb-3">
                    <span>Policy {index + 1}</span>
                    <Button variant="destructive" size="sm" onClick={() => removePolicy(index)}>
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Input {...register(`policySection.policies.${index}.title`)} placeholder="Policy Title" />
                    <div>
                      <Label className="mb-2">Background Color</Label>
                      <Input 
                        type="color" 
                        {...register(`policySection.policies.${index}.bgColor`)} 
                        className="w-full h-10"
                      />
                    </div>
                    <div>
                      <Label className="mb-2">Image Upload</Label>
                      <Input 
                        type="file" 
                        accept="image/*"
                        onChange={(e) => handlePolicyImage(e, index)}
                        className="bg-white"
                      />
                      {policyPreviews[index] && (
                        <Image
                          src={policyPreviews[index]}
                          alt={`Policy Preview ${index + 1}`}
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
            <Button type="button" onClick={() => appendPolicy({ title: '', bgColor: '#FFFFFF', image: null })}>
              <Plus className="h-4 w-4 mr-2" /> Add Policy
            </Button>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <Button type="submit" className="w-full py-6 text-lg font-semibold bg-green-600 hover:bg-green-700">
            Save All Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
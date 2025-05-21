// /src/app/dashboard/info-sections/social-media/page.js
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Plus, Minus } from 'lucide-react';

export default function SocialMediaEditor() {
  const defaultValues = useMemo(() => ({
    title: 'Social Media',
    description: 'All the Social Media Link will be added and Updated here',
    links: [
      {
        title: '',
        url: '',
        icon: '',
        image: null
      }
    ]
  }), []);

  const { register, control, handleSubmit, setValue } = useForm({ defaultValues });
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'links'
  });

  const [previews, setPreviews] = useState([]);

  const handleImageChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...previews];
        newPreviews[index] = reader.result;
        setPreviews(newPreviews);
      };
      reader.readAsDataURL(file);
      setValue(`links.${index}.image`, file);
    }
  };

  const onSubmit = (data) => {
    console.log('Social Media Data:', data);
    // Submit logic here
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-2">Social Media</h1>
      <p className="text-muted-foreground mb-8">
        All the Social Media Link will be added and Updated here
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {fields.map((field, index) => (
          <div key={field.id} className="border p-6 bg-gray-50 rounded-lg space-y-4 relative">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-medium">Social Link {index + 1}</h3>
              <Button
                type="button"
                variant="ghost"
                onClick={() => remove(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Minus className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor={`links.${index}.title`}>Title</Label>
                <Input
                  {...register(`links.${index}.title`)}
                  placeholder="Facebook, Twitter, etc."
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor={`links.${index}.url`}>URL</Label>
                <Input
                  {...register(`links.${index}.url`)}
                  placeholder="https://socialmedia.com/yourpage"
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor={`links.${index}.icon`}>Icon (Lucide name)</Label>
                <Input
                  {...register(`links.${index}.icon`)}
                  placeholder="facebook, twitter, instagram..."
                  className="bg-white"
                />
              </div>

              <div>
                <Label htmlFor={`links.${index}.image`}>Upload Image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, index)}
                  className="bg-white"
                />
                {previews[index] && (
                  <Image
                    src={previews[index]}
                    alt={`Preview ${index}`}
                    width={120}
                    height={120}
                    className="mt-2 rounded object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={() =>
            append({ title: '', url: '', icon: '', image: null })
          }
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Social Media Card
        </Button>

        <div className="pt-6">
          <Button type="submit" className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}

// /src/app/dashboard/info-sections/footer/page.js
'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

export default function FooterEditor() {
  const defaultValues = useMemo(() => ({
    footerInfo: {
      title: 'About Our Organization',
      description: 'Brief footer description about the organization'
    },
    menu1: {
      title: 'Quick Links',
      items: [{
        title: '',
        url: '',
        icon: ''
      }]
    },
    menu2: {
      title: 'Resources',
      items: [{
        title: '',
        url: '',
        icon: ''
      }]
    }
  }), []);

  const { register, handleSubmit, control } = useForm({ defaultValues });
  
  const { fields: menu1Items, append: appendMenu1, remove: removeMenu1 } = useFieldArray({
    control,
    name: 'menu1.items'
  });

  const { fields: menu2Items, append: appendMenu2, remove: removeMenu2 } = useFieldArray({
    control,
    name: 'menu2.items'
  });

  const onSubmit = (data) => {
    console.log('Footer Data:', data);
    // Submit logic here
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-10">Edit Footer Content</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* Footer Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Footer Information</h2>
          <div className="space-y-4">
            <Input {...register('footerInfo.title')} className="bg-white" placeholder="Footer Title" />
            <Textarea {...register('footerInfo.description')} rows={4} className="bg-white" placeholder="Footer Description" />
          </div>
        </div>

        {/* Menu 1 Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Menu 1</h2>
          <div className="space-y-4">
            <Input {...register('menu1.title')} className="bg-white" placeholder="Menu Title" />
            
            <div className="space-y-4">
              {menu1Items.map((item, index) => (
                <div key={item.id} className="border p-4 rounded bg-white">
                  <div className="flex justify-between mb-3">
                    <span>Item {index + 1}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMenu1(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    <Input
                      {...register(`menu1.items.${index}.title`)}
                      placeholder="Link Text"
                    />
                    <Input
                      {...register(`menu1.items.${index}.url`)}
                      placeholder="URL"
                    />
                    <Input
                      {...register(`menu1.items.${index}.icon`)}
                      placeholder="Lucide Icon Name (e.g. 'Home')"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => appendMenu1({ title: '', url: '', icon: '' })}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>
          </div>
        </div>

        {/* Menu 2 Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">Menu 2</h2>
          <div className="space-y-4">
            <Input {...register('menu2.title')} className="bg-white" placeholder="Menu Title" />
            
            <div className="space-y-4">
              {menu2Items.map((item, index) => (
                <div key={item.id} className="border p-4 rounded bg-white">
                  <div className="flex justify-between mb-3">
                    <span>Item {index + 1}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeMenu2(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid gap-4">
                    <Input
                      {...register(`menu2.items.${index}.title`)}
                      placeholder="Link Text"
                    />
                    <Input
                      {...register(`menu2.items.${index}.url`)}
                      placeholder="URL"
                    />
                    <Input
                      {...register(`menu2.items.${index}.icon`)}
                      placeholder="Lucide Icon Name (e.g. 'FileText')"
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                onClick={() => appendMenu2({ title: '', url: '', icon: '' })}
                className="mt-4"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Menu Item
              </Button>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold bg-green-600 hover:bg-green-700"
          >
            Save Footer Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
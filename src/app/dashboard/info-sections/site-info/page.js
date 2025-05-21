// /src/app/dashboard/info-sections/site-info/page.js
'use client';

import { useForm } from 'react-hook-form';
import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

export default function SiteInfoEditor() {
  const defaultValues = useMemo(() => ({
    general: {
      siteTitle: 'My Organization',
      siteUrl: 'https://example.com',
      lightLogo: null,
      darkLogo: null,
      logoVideo: null
    },
    seo: {
      ogTitle: 'Default OG Title',
      ogDescription: 'Default OG Description',
      ogImage: null,
      ogKeywords: 'keyword1, keyword2'
    }
  }), []);

  const { register, handleSubmit, setValue } = useForm({ defaultValues });
  const [lightLogoPreview, setLightLogoPreview] = useState(null);
  const [darkLogoPreview, setDarkLogoPreview] = useState(null);
  const [logoVideoPreview, setLogoVideoPreview] = useState(null);
  const [ogImagePreview, setOgImagePreview] = useState(null);

  const handleFileUpload = (e, fieldName, previewSetter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => previewSetter(reader.result);
      reader.readAsDataURL(file);
      setValue(fieldName, file);
    }
  };

  const handleVideoUpload = (e, fieldName) => {
    const file = e.target.files[0];
    if (file) {
      setValue(fieldName, file);
      setLogoVideoPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    console.log('Site Info Data:', data);
    // Submit logic here
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-10">Site Information Settings</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

        {/* General Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">General Settings</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">Site Title</Label>
                <Input {...register('general.siteTitle')} className="bg-white" />
              </div>
              <div>
                <Label className="mb-2">Site URL</Label>
                <Input {...register('general.siteUrl')} className="bg-white" />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="mb-2">Light Theme Logo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'general.lightLogo', setLightLogoPreview)}
                  className="bg-white"
                />
                {lightLogoPreview && (
                  <Image
                    src={lightLogoPreview}
                    alt="Light Logo Preview"
                    width={100}
                    height={100}
                    className="mt-2 rounded object-contain"
                  />
                )}
              </div>
              <div>
                <Label className="mb-2">Dark Theme Logo</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'general.darkLogo', setDarkLogoPreview)}
                  className="bg-white"
                />
                {darkLogoPreview && (
                  <Image
                    src={darkLogoPreview}
                    alt="Dark Logo Preview"
                    width={100}
                    height={100}
                    className="mt-2 rounded object-contain"
                  />
                )}
              </div>
              <div>
                <Label className="mb-2">Logo Video/GIF</Label>
                <Input
                  type="file"
                  accept="video/*,image/gif"
                  onChange={(e) => handleVideoUpload(e, 'general.logoVideo')}
                  className="bg-white"
                />
                {logoVideoPreview && (
                  <div className="mt-2 text-sm text-gray-500">
                    {logoVideoPreview.type.startsWith('video') ? (
                      <video src={logoVideoPreview} className="h-20 w-auto" controls />
                    ) : (
                      <Image
                        src={logoVideoPreview}
                        alt="Video/GIF Preview"
                        width={100}
                        height={100}
                        className="rounded object-contain"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* SEO Section */}
        <div className="bg-purple-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-6">SEO Settings</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label className="mb-2">OG Title</Label>
                <Input {...register('seo.ogTitle')} className="bg-white" />
              </div>
              <div>
                <Label className="mb-2">OG Keywords</Label>
                <Input {...register('seo.ogKeywords')} className="bg-white" />
              </div>
            </div>
            <div>
              <Label className="mb-2">OG Description</Label>
              <Textarea {...register('seo.ogDescription')} rows={3} className="bg-white" />
            </div>
            <div>
              <Label className="mb-2">OG Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, 'seo.ogImage', setOgImagePreview)}
                className="bg-white"
              />
              {ogImagePreview && (
                <Image
                  src={ogImagePreview}
                  alt="OG Image Preview"
                  width={200}
                  height={100}
                  className="mt-2 rounded object-cover"
                />
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <Button
            type="submit"
            className="w-full py-6 text-lg font-semibold bg-blue-600 hover:bg-blue-700"
          >
            Save Site Information
          </Button>
        </div>
      </form>
    </div>
  );
}
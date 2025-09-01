//src/app/dashboard/projects-menu/projects/edit/page.js
'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import decodeHtml from '@/lib/decodeHtml';
import { Pencil, Trash2, Plus, X } from 'lucide-react';
import ConfirmDialog from '@/components/features/popup/ConfirmDialog';
import ImageSection from '@/components/features/ImageVideoEdit/ImageSection';
import VideoSection from '@/components/features/ImageVideoEdit/VideoSection';

export default function EditProjectPage() {
  const { register, handleSubmit, setValue, watch } = useForm();
  const [initiatives, setInitiatives] = useState([]);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [projectId, setProjectId] = useState(null);
  const [previousInitiativeId, setPreviousInitiativeId] = useState(null);
  const [isSlugManualEdit, setIsSlugManualEdit] = useState(false);

  const [cards, setCards] = useState([]);
  const [editingCardId, setEditingCardId] = useState(null);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ open: false, cardId: null });

  // FAQ states
  const [faqs, setFaqs] = useState([]);
  const [editingFaqId, setEditingFaqId] = useState(null);
  const [showAddFaqForm, setShowAddFaqForm] = useState(false);
  const [faqConfirmDialog, setFaqConfirmDialog] = useState({ open: false, faqId: null });

  // ==================== NEW: IMAGE STATES ====================
  const [images, setImages] = useState([]);
  const [editingImageId, setEditingImageId] = useState(null);
  const [showAddImageForm, setShowAddImageForm] = useState(false);
  const [imageConfirmDialog, setImageConfirmDialog] = useState({ open: false, imageId: null });

  // ==================== NEW: VIDEO STATES ====================
  const [videos, setVideos] = useState([]);
  const [editingVideoId, setEditingVideoId] = useState(null);
  const [showAddVideoForm, setShowAddVideoForm] = useState(false);
  const [videoConfirmDialog, setVideoConfirmDialog] = useState({ open: false, videoId: null });

  // ==================== NEW: PROJECT TYPES STATE ====================
  const [projectTypes, setProjectTypes] = useState([]);

  const router = useRouter();
  const searchParams = useSearchParams();
  const [storedInitiativeId, setStoredInitiativeId] = useState('');

  const titleValue = watch("title");
  const slugValue = watch("slug");

  // -------------------
  // Auto-generate slug
  // -------------------
  useEffect(() => {
    if (titleValue && !isSlugManualEdit) {
      const generatedSlug = titleValue
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setValue('slug', generatedSlug);
    }
  }, [titleValue, isSlugManualEdit, setValue]);

  // -------------------
  // Load project
  // -------------------
  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setProjectId(id);
      fetchProject(id);
      fetchCards(id);
      fetchFaqs(id);
      fetchImages(id); // NEW: Fetch images
      fetchVideos(id); // NEW: Fetch videos
      fetchProjectTypes(); // NEW: Fetch project types
    }
  }, [searchParams]);

  // -------------------
  // Set initiative after fetching
  // -------------------
  useEffect(() => {
    if (storedInitiativeId && initiatives.length > 0) {
      setValue('initiativeid', storedInitiativeId);
    }
  }, [storedInitiativeId, initiatives, setValue]);

  // -------------------
  // Fetch project
  // -------------------
  const fetchProject = async (id) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/project/${id}`, { withCredentials: true });
      const data = res.data.project;

      setValue('title', decodeHtml(data.title));
      setValue("slug", data.slug || "");
      setValue('description', decodeHtml(data.description));
      setValue('videourl', data.videourl || '');
      setValue('importance', decodeHtml(data.importance));
      setValue('whatwedo', decodeHtml(data.whatwedo));

      const initiativeId = data.initiatives?.[0]?.id?.toString() || '';
      setStoredInitiativeId(initiativeId);
      setPreviousInitiativeId(initiativeId);

      if (data.imagepath) {
        setMainImagePreview(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.imagepath.replace(/\\/g, '/')}`);
      }
      if (data.filepath) {
        setFilePreview(`${process.env.NEXT_PUBLIC_BACKEND_URL}/${data.filepath.replace(/\\/g, '/')}`);
      }

      fetchInitiatives();
    } catch (err) {
      toast.error('Failed to load project data');
      console.error(err);
    }
  };

  // -------------------
  // Fetch initiatives
  // -------------------
  const fetchInitiatives = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allinitiative`, { withCredentials: true });
      setInitiatives(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load initiatives');
      console.error(err);
    }
  };

  // -------------------
  // Fetch cards
  // -------------------
  const fetchCards = async (projId) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cards/project/${projId}`, { withCredentials: true });
      setCards(res.data.cardData || []);
    } catch (err) {
      toast.error('Failed to load cards');
      console.error(err);
    }
  };

  // -------------------
  // Fetch FAQs
  // -------------------
  const fetchFaqs = async (projId) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/projectfaq/${projId}`, {
        withCredentials: true,
      });

      // Use the correct key: `faqs`
      const faqsData = Array.isArray(res.data.faqs) ? res.data.faqs : [];
      setFaqs(faqsData);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load FAQs');
    }
  };

  // ==================== UPDATED: FETCH IMAGES ====================
  const fetchImages = async (projId) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/images/project/${projId}`, {
        withCredentials: true,
      });
      
      // For each image, fetch the full details including projecttypes
      const imagesWithDetails = await Promise.all(
        (res.data.images || []).map(async (image) => {
          try {
            const imageDetailRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${image.id}`, {
              withCredentials: true,
            });
            return imageDetailRes.data.image;
          } catch (err) {
            console.error(`Failed to fetch details for image ${image.id}:`, err);
            return image; // Return the basic image data if detail fetch fails
          }
        })
      );
      
      setImages(imagesWithDetails);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load images');
    }
  };

  // ==================== UPDATED: FETCH VIDEOS ====================
  const fetchVideos = async (projId) => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/videos/project/${projId}`, {
        withCredentials: true,
      });
      
      // For each video, fetch the full details including projecttypes
      const videosWithDetails = await Promise.all(
        (res.data.videos || []).map(async (video) => {
          try {
            const videoDetailRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/video/${video.id}`, {
              withCredentials: true,
            });
            return videoDetailRes.data;
          } catch (err) {
            console.error(`Failed to fetch details for video ${video.id}:`, err);
            return video; // Return the basic video data if detail fetch fails
          }
        })
      );
      
      setVideos(videosWithDetails);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load videos');
    }
  };

  // ==================== NEW: FETCH PROJECT TYPES ====================
  const fetchProjectTypes = async () => {
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allprojecttypes`, {
        withCredentials: true,
      });
      setProjectTypes(res.data.projectTypes || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load project types');
    }
  };

  // -------------------
  // Image previews
  // -------------------
  const handleMainImagePreview = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = FileReader();
      reader.onloadend = () => setMainImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleFilePreview = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image')) {
      const reader = FileReader();
      reader.onloadend = () => setFilePreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setFilePreview(null);
    }
  };

  // -------------------
  // Submit project
  // -------------------
  const onSubmitProject = async (data) => {
    const formData = new FormData();
    formData.append('id', projectId);
    formData.append('title', data.title);
    formData.append('slug', data.slug);
    formData.append('description', data.description);
    formData.append('importance', data.importance);
    formData.append('whatwedo', data.whatwedo);
    formData.append('videourl', data.videourl);

    if (data.main && data.main[0]) formData.append('main', data.main[0]);
    if (data.files && data.files[0]) formData.append('files', data.files[0]);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/editproject`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      const newInitiativeId = data.initiativeid?.toString();
      if (previousInitiativeId !== newInitiativeId) {
        if (previousInitiativeId) {
          await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deleteinitproject`, { projectid: projectId, initiativeid: previousInitiativeId }, { withCredentials: true });
        }
        if (newInitiativeId) {
          await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/addinitiativeproject`, { projectid: projectId, initiativeid: newInitiativeId }, { withCredentials: true });
        }
      }

      toast.success('Project updated successfully');
      router.push('/dashboard/projects-menu/projects/');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update project');
    }
  };

  // -------------------
  // Delete Card
  // -------------------
  const handleDeleteCard = async (cardId) => {
    try {
      await axios.delete(`${process.env.NEXT_PPUBLIC_BACKEND_URL}/removeproject/${cardId}/${projectId}`, { withCredentials: true });
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deletecard`, { data: { id: cardId }, withCredentials: true });
      toast.success('Card deleted successfully');
      fetchCards(projectId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete card');
    } finally {
      setConfirmDialog({ open: false, cardId: null });
    }
  };

  // -------------------
  // Edit Card
  // -------------------
  const handleEditCard = async (cardId, cardData, file) => {
    try {
      const formData = new FormData();
      formData.append('id', cardId);
      formData.append('title', cardData.title);
      formData.append('number', cardData.number);
      formData.append('suffix', cardData.suffix);
      formData.append('text', cardData.text);
      if (file) formData.append('icon', file);
      formData.append('projectid', projectId);

      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/editcard`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success('Card updated successfully');
      setEditingCardId(null);
      fetchCards(projectId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update card');
    }
  };

  // -------------------
  // Delete FAQ
  // -------------------
  const handleDeleteFaq = async (faqId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/deletefaq`, {
        data: { id: faqId },
        withCredentials: true,
      });
      toast.success('FAQ deleted successfully');
      fetchFaqs(projectId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete FAQ');
    } finally {
      setFaqConfirmDialog({ open: false, faqId: null });
    }
  };

  // -------------------
  // Add/Edit FAQ
  // -------------------
  const handleFaqSubmit = async (data) => {
    try {
      if (editingFaqId) {
        // Edit FAQ
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/editfaq`, {
          id: editingFaqId,
          question: data.question,
          answer: data.answer,
          projectId,
        }, { withCredentials: true });
        toast.success('FAQ updated successfully');
      } else {
        // Create FAQ
        await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createfaq`, {
          question: data.question,
          answer: data.answer,
          projectId,
        }, { withCredentials: true });
        toast.success('FAQ created successfully');
      }
      setShowAddFaqForm(false);
      setEditingFaqId(null);
      fetchFaqs(projectId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to save FAQ');
    }
  };

  // ==================== NEW: IMAGE HANDLERS ====================
  
  /**
   * Delete image with confirmation
   * @param {number} imageId - ID of the image to delete
   */
  const handleDeleteImage = async (imageId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/removeimageproject/${imageId}/${projectId}`, { 
        withCredentials: true 
      });
      toast.success('Image removed from project successfully');
      fetchImages(projectId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove image');
    } finally {
      setImageConfirmDialog({ open: false, imageId: null });
    }
  };

  /**
   * Handle image form submission for create/edit
   * @param {Object} data - Form data
   * @param {File} file - Image file
   * @param {Array} selectedProjectTypes - Selected project type objects from MultiSelect
   */
  const handleImageSubmit = async (data, file, selectedProjectTypes) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('alt', data.alt);
      formData.append('description', data.description || '');
      formData.append('caption', data.caption || '');
      
      if (file) {
        formData.append('imagepath', file);
      }
      
      // Add project ID
      formData.append('projectIds', projectId);
      
      // Add project type IDs if selected (extract IDs from MultiSelect format)
      if (selectedProjectTypes && selectedProjectTypes.length > 0) {
        selectedProjectTypes.forEach(type => {
          formData.append('projectTypeIds', type.value);
        });
      }

      let endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/createimage`;
      
      if (editingImageId) {
        formData.append('id', editingImageId);
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/editimage`;
        
        // For editing, we need to handle project type associations separately
        // First, get current image data to compare
        try {
          const currentImageRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/image/${editingImageId}`, { withCredentials: true });
          const currentProjectTypes = currentImageRes.data.image.projecttypes || [];
          
          // Remove old project type associations
          await Promise.all(
            currentProjectTypes.map(async (pt) => {
              const isStillSelected = selectedProjectTypes.some(selected => selected.value === pt.id.toString());
              if (!isStillSelected) {
                await axios.delete(
                  `${process.env.NEXT_PUBLIC_BACKEND_URL}/removeimageprojecttype/${editingImageId}/${pt.id}`,
                  { withCredentials: true }
                );
              }
            })
          );
        } catch (err) {
          console.error('Error fetching current image data:', err);
          // Continue with the update even if we can't fetch current data
        }
      }

      await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success(`Image ${editingImageId ? 'updated' : 'created'} successfully`);
      setShowAddImageForm(false);
      setEditingImageId(null);
      fetchImages(projectId);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${editingImageId ? 'update' : 'create'} image`);
    }
  };

  // ==================== NEW: VIDEO HANDLERS ====================
  
  /**
   * Delete video with confirmation
   * @param {number} videoId - ID of the video to delete
   */
  const handleDeleteVideo = async (videoId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/removevideoproject/${videoId}/${projectId}`, { 
        withCredentials: true 
      });
      toast.success('Video removed from project successfully');
      fetchVideos(projectId);
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove video');
    } finally {
      setVideoConfirmDialog({ open: false, videoId: null });
    }
  };

  /**
   * Handle video form submission for create/edit
   * @param {Object} data - Form data
   * @param {File} file - Video file
   * @param {Array} selectedProjectTypes - Selected project type objects from MultiSelect
   * @param {number} videoId - ID of the video being edited (null for new videos)
   */
  const handleVideoSubmit = async (data, file, selectedProjectTypes, videoId = null) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('alt', data.alt);
      formData.append('description', data.description || '');
      formData.append('videourl', data.videourl || '');
      
      if (file) {
        formData.append('videopath', file);
      }
      
      // Add project ID
      formData.append('projectIds', projectId);
      
      // <<< REMOVE this block, do NOT append projectTypeIds here >>>
      // if (selectedProjectTypes && selectedProjectTypes.length > 0) {
      //   selectedProjectTypes.forEach(type => {
      //     formData.append('projectTypeIds', type.value);
      //   });
      // }
      
      let endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/createvideo`;
      
      if (videoId) {
        formData.append('id', videoId);
        endpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/editvideo`;
        
        try {
          // First, get current video data to compare
          const currentVideoRes = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/video/${videoId}`, { 
            withCredentials: true 
          });
          
          const currentProjectTypes = currentVideoRes.data.projecttypes || [];
          const selectedProjectTypeIds = selectedProjectTypes.map(pt => pt.value);
          
          // Remove old project type associations that are no longer selected
          await Promise.all(
            currentProjectTypes.map(async (pt) => {
              const isStillSelected = selectedProjectTypeIds.includes(pt.id.toString());
              if (!isStillSelected) {
                try {
                  await axios.delete(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/removevideoprojecttype/${videoId}/${pt.id}`,
                    { withCredentials: true }
                  );
                } catch (err) {
                  console.error(`Failed to remove project type ${pt.id} from video ${videoId}:`, err);
                }
              }
            })
          );
          
          // Add new project type associations that weren't previously selected
          await Promise.all(
            selectedProjectTypeIds.map(async (typeId) => {
              const wasPreviouslySelected = currentProjectTypes.some(pt => pt.id.toString() === typeId);
              if (!wasPreviouslySelected) {
                try {
                  await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/addvideoprojecttype`,
                    { 
                      videoId: videoId, 
                      projectTypeId: typeId 
                    },
                    { withCredentials: true }
                  );
                } catch (err) {
                  console.error(`Failed to add project type ${typeId} to video ${videoId}:`, err);
                }
              }
            })
          );
        } catch (err) {
          console.error('Error fetching current video data:', err);
          // Continue with the update even if we can't fetch current data
        }
      }
      
      // Update the video details (title, alt, description, etc.)
      await axios.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      
      toast.success(`Video ${videoId ? 'updated' : 'created'} successfully`);
      setShowAddVideoForm(false);
      setEditingVideoId(null);
      fetchVideos(projectId);
    } catch (err) {
      console.error(err);
      toast.error(`Failed to ${videoId ? 'update' : 'create'} video`);
    }
  };


  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Edit Project</h1>

      {/* Project Form */}
      <form onSubmit={handleSubmit(onSubmitProject)} className="space-y-8">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" {...register('title')} required className="bg-white mt-1" />
        </div>
        <div>
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" {...register('slug')} required className="bg-white mt-1" value={slugValue || ""} onChange={() => setIsSlugManualEdit(true)} />
        </div>
        <div>
          <Label htmlFor="description">Description (supports HTML)</Label>
          <Textarea id="description" {...register('description')} rows={4} className="bg-white mt-1" />
        </div>
        <div>
          <Label htmlFor="importance">Importance (supports HTML)</Label>
          <Textarea id="importance" {...register('importance')} rows={3} className="bg-white mt-1" />
        </div>
        <div>
          <Label htmlFor="whatwedo">What We Do (supports HTML)</Label>
          <Textarea id="whatwedo" {...register('whatwedo')} rows={3} className="bg-white mt-1" />
        </div>
        <div>
          <Label htmlFor="main">Main Image</Label>
          <Input type="file" id="main" {...register('main')} accept="image/*" onChange={handleMainImagePreview} className="bg-white mt-1" />
          {mainImagePreview && <Image src={mainImagePreview} alt="Main Preview" width={400} height={250} className="mt-3 rounded object-cover" />}
        </div>
        <div>
          <Label htmlFor="videourl">Video URL</Label>
          <Input id="videourl" {...register('videourl')} placeholder="https://youtube.com/..." className="bg-white mt-1" />
        </div>
        <div>
          <Label htmlFor="files">Upload File (Image/Video)</Label>
          <Input type="file" id="files" {...register('files')} accept="image/*,video/*" onChange={handleFilePreview} className="bg-white mt-1" />
          {filePreview && <Image src={filePreview} alt="Media Preview" width={400} height={250} className="mt-3 rounded object-cover" />}
        </div>
        <div>
          <Label htmlFor="initiativeid">Select Initiative</Label>
          <select id="initiativeid" {...register('initiativeid')} required className="bg-white mt-1 px-3 py-2 border rounded w-full">
            <option value="">-- Select Initiative --</option>
            {initiatives.map(item => <option key={item.id} value={item.id.toString()}>{item.name}</option>)}
          </select>
        </div>
        <div>
          <Button type="submit" className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white text-lg">Update Project</Button>
        </div>
      </form>

      {/* -------------------
          Cards Section
      ------------------- */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Cards</h2>
        <Button onClick={() => setShowAddCardForm(prev => !prev)} className="mb-4 flex items-center gap-2">
          <Plus /> Add New Card
        </Button>

        {showAddCardForm && <AddCardForm projectId={projectId} onCardAdded={(newCardId) => { fetchCards(projectId); setEditingCardId(newCardId); setShowAddCardForm(false); }} onCancel={() => setShowAddCardForm(false)} />}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-white p-4 rounded shadow relative">
              {editingCardId === card.id ? (
                <CardEditForm card={card} onSave={handleEditCard} onCancel={() => setEditingCardId(null)} />
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">{card.title}</h3>
                      <p>{card.number} {card.suffix}</p>
                      <p>{card.text}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Pencil className="cursor-pointer text-blue-500" onClick={() => setEditingCardId(card.id)} />
                      <Trash2 className="cursor-pointer text-red-500" onClick={() => setConfirmDialog({ open: true, cardId: card.id })} />
                    </div>
                  </div>
                  {card.icon && <Image src={`${process.env.NEXT_PUBLIC_BACKEND_URL}/${card.icon}`} alt="Icon" width={100} height={100} className="mt-3 object-cover rounded" />}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* -------------------
          FAQ Section
      ------------------- */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">FAQs</h2>
        <Button onClick={() => setShowAddFaqForm(prev => !prev)} className="mb-4 flex items-center gap-2">
          <Plus /> Add New FAQ
        </Button>

        {showAddFaqForm && (
          <FaqForm
            onSubmit={handleFaqSubmit}
            onCancel={() => { setShowAddFaqForm(false); setEditingFaqId(null); }}
            faq={editingFaqId ? faqs.find(f => f.id === editingFaqId) : null}
          />
        )}

        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {faqs.map(faq => (
            <div key={faq.id} className="bg-white p-4 rounded shadow relative">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{faq.question}</h3>
                  <p className="mt-2 text-gray-700">{faq.answer}</p>
                </div>
                <div className="flex space-x-2">
                  <Pencil className="cursor-pointer text-blue-500" onClick={() => { setEditingFaqId(faq.id); setShowAddFaqForm(true); }} />
                  <Trash2 className="cursor-pointer text-red-500" onClick={() => setFaqConfirmDialog({ open: true, faqId: faq.id })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ==================== IMAGES SECTION ==================== */}
      <ImageSection
        images={images}
        projectTypes={projectTypes}
        projectId={projectId}
        onImageSubmit={handleImageSubmit}
        onDeleteImage={handleDeleteImage}
        fetchImages={() => fetchImages(projectId)}
        editingImageId={editingImageId}
        setEditingImageId={setEditingImageId}
      />

      {/* ==================== VIDEOS SECTION ==================== */}
      <VideoSection
        videos={videos}
        projectTypes={projectTypes}
        projectId={projectId}
        onVideoSubmit={handleVideoSubmit}
        onDeleteVideo={handleDeleteVideo}
        fetchVideos={() => fetchVideos(projectId)}
        editingVideoId={editingVideoId}
        setEditingVideoId={setEditingVideoId}
      />

      {/* ==================== CONFIRMATION DIALOGS ==================== */}
      
      {/* Card Delete Confirmation */}
      <ConfirmDialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, cardId: null })}
        onConfirm={() => handleDeleteCard(confirmDialog.cardId)}
        title="Are you sure you want to delete this card?"
        description="This action is irreversible and will permanently remove the card."
        confirmText="Yes, delete"
        cancelText="Cancel"
      />

      {/* FAQ Delete Confirmation */}
      <ConfirmDialog
        open={faqConfirmDialog.open}
        onClose={() => setFaqConfirmDialog({ open: false, faqId: null })}
        onConfirm={() => handleDeleteFaq(faqConfirmDialog.faqId)}
        title="Are you sure you want to delete this FAQ?"
        description="This action is irreversible and will permanently remove the FAQ."
        confirmText="Yes, delete"
        cancelText="Cancel"
      />
    </div>
  );
}

// -------------------
// Add/Edit Card Form
// -------------------
function AddCardForm({ projectId, onCardAdded, onCancel }) {
  const { register, handleSubmit, reset } = useForm();
  const [file, setFile] = useState(null);
  const [previewIcon, setPreviewIcon] = useState(null);

  const handleIconChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewIcon(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const onSubmit = async (data) => {
    if (!projectId) return toast.error('Project ID not found');

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('number', data.number);
      formData.append('suffix', data.suffix);
      formData.append('text', data.text);
      if (file) formData.append('icon', file);
      formData.append('projectids', projectId);

      const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/createcard`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });

      toast.success('Card created successfully');
      reset();
      setFile(null);
      setPreviewIcon(null);
      onCardAdded(res.data?.id);
    } catch (err) {
      console.error(err);
      toast.error('Failed to create card');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded mb-6 space-y-3">
      <div>
        <Label>Title</Label>
        <Input {...register("title", { required: true })} placeholder="Title" />
      </div>
      <div>
        <Label>Number</Label>
        <Input type="number" {...register("number", { required: true, valueAsNumber: true })} placeholder="Number" />
      </div>
      <div>
        <Label>Suffix (optional)</Label>
        <Input {...register("suffix")} placeholder="+, %, etc." />
      </div>
      <div>
        <Label>Text</Label>
        <Textarea {...register("text", { required: true })} rows={2} placeholder="Text" />
      </div>
      <div>
        <Label>Icon</Label>
        {previewIcon ? <Image src={previewIcon} alt="Preview" width={80} height={80} className="rounded mt-2" /> : <p className="mt-2 text-gray-50">No icon selected</p>}
        <Input type="file" accept="image/*" onChange={handleIconChange} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">Add Card</Button>
      </div>
    </form>
  );
}

// -------------------
// Edit Card Form
// -------------------
function CardEditForm({ card, onSave, onCancel }) {
  const { register, handleSubmit } = useForm({
    defaultValues: {
      title: card.title,
      number: card.number,
      suffix: card.suffix,
      text: card.text,
    },
  });

  const [file, setFile] = useState(null);
  const [previewIcon, setPreviewIcon] = useState(card.icon ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${card.icon}` : null);

  const handleIconChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewIcon(reader.result);
      reader.readAsDataURL(selectedFile);
    }
  };

  const onSubmit = (data) => onSave(card.id, data, file);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
      <div>
        <Label>Title</Label>
        <Input {...register('title')} placeholder="Title" />
      </div>
      <div>
        <Label>Number</Label>
        <Input type="number" {...register('number')} placeholder="Number" />
      </div>
      <div>
        <Label>Suffix</Label>
        <Input {...register('suffix')} placeholder="Suffix" />
      </div>
      <div>
        <Label>Text</Label>
        <Textarea {...register('text')} placeholder="Text" rows={2} />
      </div>
      <div>
        <Label>Icon</Label>
        {previewIcon && <Image src={previewIcon} alt="Preview" width={80} height={80} className="rounded mt-2" />}
        <Input type="file" accept="image/*" onChange={handleIconChange} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">Update</Button>
      </div>
    </form>
  );
}

// -------------------
// Add/Edit FAQ Form
// -------------------
function FaqForm({ onSubmit, onCancel, faq }) {
  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      question: faq?.question || '',
      answer: faq?.answer || '',
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-50 p-4 rounded mb-6 space-y-3">
      <div>
        <Label>Question</Label>
        <Input {...register("question", { required: "Question is required" })} defaultValue={faq?.question || ""} disabled={isSubmitting} />
      </div>
      <div>
        <Label>Answer</Label>
        <Textarea {...register("answer", { required: "Answer is required" })} defaultValue={faq?.answer || ""} rows={4} disabled={isSubmitting} />
      </div>
      <div className="flex gap-2 mt-6">
        <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : (faq ? "Save Changes" : "Add FAQ")}
        </Button>
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
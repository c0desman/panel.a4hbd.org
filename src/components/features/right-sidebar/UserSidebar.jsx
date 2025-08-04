'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Eye, EyeOff, Upload, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { USER_ROLES } from '@/constants';

export default function UserSidebar({ open, mode, user, onClose, onSave, onDelete, isProcessing = false }) {
  if (!open || (mode !== 'add' && !user)) return null;

  const isView = mode === 'view';
  const isEdit = mode === 'edit';

  const [partners, setPartners] = useState([]);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, reset, watch, setValue } = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      usertype: '',
      partnerId: '',
      isActive: 'true',
      isvalid: 'true',
      password: '',
      bio: '',
      avatar: null,
      avatarPreview: '/images/default-avatar.png',
    },
  });

  const avatarPreview = watch('avatarPreview');

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/partners?status=active`, { withCredentials: true })
      .then(res => setPartners(res.data.data || []))
      .catch(() => toast.error('Failed to load partners'));
  }, []);

  useEffect(() => {
    if (mode === 'add') return;
    axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/${user.id}`, { withCredentials: true })
      .then(res => {
        const u = res.data.data;
        reset({
          first_name: u.first_name || '',
          last_name: u.last_name || '',
          email: u.email || '',
          phone: u.phone || '',
          usertype: u.usertype || '',
          partnerId: u.partnerId || '',
          isActive: u.isActive ? 'true' : 'false',
          isvalid: u.isvalid ? 'true' : 'false',
          password: '',
          bio: u.profile?.bio || '',
          avatar: null,
          avatarPreview: u.profile?.profilepicture
            ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/${u.profile.profilepicture.replace(/\\/g, '/')}`
            : '/images/default-avatar.png',
        });
      })
      .catch(() => toast.error('Failed to load user data'));
  }, [user?.id, mode]);

  const handleAvatarChange = e => {
    const file = e.target.files[0];
    if (file?.type.startsWith('image/')) {
      setValue('avatar', file);
      setValue('avatarPreview', URL.createObjectURL(file));
    }
  };

  const onSubmit = (data) => {
    const form = new FormData();

    // Mandatory
    form.append("id", user.id); // string is OK, backend parses it
    form.append("first_name", data.first_name);
    form.append("last_name", data.last_name);
    form.append("email", data.email);
    form.append("phone", data.phone);
    form.append("usertype", data.usertype);

    // Optional/conditional
    if (data.password) {
      form.append("password", data.password); // backend handles bcrypt
    }
    form.append("isActive", data.isActive); // e.g., "true"
    form.append("isvalid", data.isvalid); // e.g., "true"
    form.append("partnerId", data.partnerId || "");
    form.append("bio", data.bio || "");

    if (data.avatar) {
      form.append("image", data.avatar); // This will go to req.file
    }

    const endpoint = "/edituser";

    axios.post(process.env.NEXT_PUBLIC_BACKEND_URL + endpoint, form, {
      withCredentials: true,
    }).then(() => {
      toast.success("User updated");
      onSave(); // refresh user list
      onClose(); // close sidebar
    }).catch((err) => {
      console.error("FormData error:", Object.fromEntries(form.entries())); // debug
      toast.error(err.response?.data?.error || "Update failed");
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-full sm:max-w-md bg-white shadow-xl border-l overflow-auto">
          <div className="flex justify-between items-center px-6 py-4 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <h2 className="text-lg font-semibold">
            {mode === 'add' ? 'Add User' : isEdit ? 'Edit User' : 'User Details'}
          </h2>
          <div className="flex gap-2">
            {!isView && <Button variant="ghost" size="icon" onClick={onDelete}><Trash2 /></Button>}
            <Button variant="ghost" size="icon" onClick={onClose}><X /></Button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex justify-center relative">
            <Image
              src={avatarPreview}
              width={120}
              height={120}
              className="rounded-full object-cover"
              alt="Avatar"
            />
            {!isView && (
              <label htmlFor="avatar" className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full text-white">
                <Upload />
                <input id="avatar" type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
              </label>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-100">
                <Label className='mb-2'>First Name</Label>
                <Input {...register('first_name')} />
              </div>
              <div className="w-100">
                <Label className='mb-2'>Last Name</Label>
                <Input {...register('last_name')} />
              </div>
            </div>
            <div><Label className='mb-2'>Email</Label><Input type="email" {...register('email')} /></div>
            <div><Label>Phone</Label><Input type="tel" {...register('phone')} /></div>

            <div><Label className='mb-2'>User Type</Label>
              <Select
                value={watch("usertype") || ""}
                onValueChange={(v) => setValue("usertype", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select user type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(USER_ROLES).map((role) => (
                    <SelectItem key={role} value={role}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div><Label className='mb-2'>Partner</Label>
              <Select
                value={watch("partnerId") || "none"}
                onValueChange={(v) => setValue("partnerId", v === "none" ? "" : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select partner (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">—None—</SelectItem>
                  {partners.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      #{p.id} : {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4">
              <div className="w-100">
                <Label className='mb-2'>Status</Label>
                <Select
                  value={watch("isActive") ?? "true"}
                  onValueChange={(v) => setValue("isActive", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Active</SelectItem>
                    <SelectItem value="false">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-100">
                <Label className='mb-2'>Valid</Label>
                <Select
                  value={watch("isvalid") ?? "true"}
                  onValueChange={(v) => setValue("isvalid", v)}
                >
                  <SelectTrigger><SelectValue placeholder="Select validity" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Verified</SelectItem>
                    <SelectItem value="false">Not Verified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div><Label className='mb-2'>Bio</Label><Textarea {...register('bio')} /></div>

            <div>
              <Label className='mb-2'>Password</Label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder={isEdit ? 'Leave blank to keep current' : ''}
                  {...register('password')}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700" disabled={isProcessing}>
                {isEdit ? 'Update' : 'Create'}
              </Button>
              <Button type="button" variant="destructive" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

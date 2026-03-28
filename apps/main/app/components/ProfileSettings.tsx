"use client";
import { Button, Card, Input } from "@luminbridge/ui";
import React, { useState } from 'react';
import { User as UserIcon, Mail, Phone, Building2, Save } from 'lucide-react';
import { User } from "@luminbridge/types";
import { toast } from 'react-hot-toast';

interface ProfileSettingsProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export const ProfileSettings = ({ user, onUpdate }: ProfileSettingsProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    company_name: user.company_name || '',
    whatsapp_number: user.whatsapp_number || '',
    email: user.email || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        onUpdate(updatedUser);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile.');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('An error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card className="p-8 border-0 shadow-2xl bg-zinc-900/80 backdrop-blur-xl rounded-[2.5rem]">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-zinc-900 shadow-lg">
            <UserIcon size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-white">Profile Settings</h2>
            <p className="text-zinc-400 text-sm">Manage your account information</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div className="relative group">
              <Building2 className="absolute left-5 top-[38px] text-zinc-400 group-focus-within:text-white transition-colors" size={18} />
              <Input 
                label="Company Name"
                value={formData.company_name}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, company_name: e.target.value })}
                className="pl-12"
              />
            </div>

            <div className="relative group">
              <Mail className="absolute left-5 top-[38px] text-zinc-400 group-focus-within:text-white transition-colors" size={18} />
              <Input 
                label="Email Address"
                value={formData.email}
                disabled
                className="pl-12 opacity-60"
              />
            </div>

            <div className="relative group">
              <Phone className="absolute left-5 top-[38px] text-zinc-400 group-focus-within:text-white transition-colors" size={18} />
              <Input 
                label="WhatsApp Number"
                value={formData.whatsapp_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                className="pl-12"
                placeholder="+1 234 567 890"
              />
            </div>
          </div>

          <div className="pt-6">
            <Button type="submit" className="w-full h-14 rounded-2xl shadow-xl shadow-zinc-950/20 active:scale-[0.98] transition-transform" loading={isSaving}>
              <Save size={18} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

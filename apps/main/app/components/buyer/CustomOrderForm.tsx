"use client";
import { Button, Card, Input } from "@luminbridge/ui";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, Image as ImageIcon, Send, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

const customOrderSchema = z.object({
  requirements: z.string().min(10, 'Requirements must be at least 10 characters'),
  photo: z.string().optional(),
});

type CustomOrderFormData = z.infer<typeof customOrderSchema>;

interface CustomOrderFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const CustomOrderForm = ({ onSubmit, onCancel }: CustomOrderFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<CustomOrderFormData>({
    resolver: zodResolver(customOrderSchema),
    defaultValues: {
      requirements: '',
      photo: ''
    }
  });
  const [photoPreview, setPhotoPreview] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onFormSubmit = async (data: CustomOrderFormData) => {
    try {
      setIsUploading(true);
      await onSubmit({ ...data, photo: photoPreview });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Failed to submit request.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
        className="absolute inset-0 bg-white dark:bg-zinc-900/40 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg"
      >
        <Card className="p-8 border-0 shadow-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[2.5rem]">
          <button onClick={onCancel} className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-100 dark:bg-zinc-800 transition-colors">
            <X size={18} className="text-zinc-500 dark:text-zinc-400" />
          </button>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white mb-2">New Custom Request</h2>
            <p className="text-sm text-zinc-500">Provide details for your custom manufacturing request.</p>
          </div>

          <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
            <div className="space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Reference Image</label>
              <div className="aspect-video rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-800/20 hover:bg-zinc-100/50 transition-all cursor-pointer relative overflow-hidden group">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <div className="flex flex-col items-center text-center p-6">
                    <ImageIcon className="text-zinc-700 dark:text-zinc-300 dark:text-zinc-600 mb-4" size={48} strokeWidth={1} />
                    <p className="text-sm font-medium text-zinc-500">Click to upload image</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[11px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 ml-1">Requirements</label>
              <textarea 
                {...register('requirements')}
                className="w-full px-5 py-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-900/5 focus:border-zinc-300 dark:border-zinc-900 transition-all h-32 resize-none text-sm"
                placeholder="Describe your requirements in detail..."
              />
              {errors.requirements && <p className="text-xs text-red-500 ml-1">{errors.requirements.message}</p>}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onCancel} className="flex-1 rounded-2xl h-14">Cancel</Button>
              <Button type="submit" className="flex-[2] rounded-2xl h-14" loading={isUploading}>
                <Send size={18} className="mr-2" />
                Submit Request
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
};

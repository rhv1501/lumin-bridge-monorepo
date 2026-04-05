"use client";
import { Button, Card, Input } from "@luminbridge/ui";
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Save, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Product } from "@luminbridge/types";
import { toast } from 'react-hot-toast';

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  specifications: z.string().optional(),
  factory_price_cny: z.number().min(0.01, 'Price must be greater than 0'),
  status: z.enum(['draft', 'published']),
  photo: z.string().optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  initialData?: Product;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const ProductForm = ({ initialData, onSubmit, onCancel }: ProductFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      specifications: initialData?.specifications || '',
      factory_price_cny: initialData?.factory_price_cny || 0,
      status: (initialData?.status as any) || 'draft',
      photo: initialData?.photo || ''
    }
  });
  const [photoPreview, setPhotoPreview] = useState(initialData?.photo || '');
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

  const onFormSubmit = async (data: ProductFormData) => {
    try {
      setIsUploading(true);
      await onSubmit({ ...data, photo: photoPreview });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to save product.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-8 sm:p-10 border-0 shadow-2xl bg-white/90 dark:bg-zinc-900/90 backdrop-blur-2xl rounded-[2rem]">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {initialData ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button 
          onClick={onCancel}
          className="p-2.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-100 dark:bg-zinc-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-8">
            <Input label="Product Name" {...register('name')} placeholder="Enter product name" />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Description</label>
              <textarea 
                {...register('description')}
                className="w-full px-5 py-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-800/50 border border-transparent focus:outline-none focus:ring-2 focus:ring-zinc-900/20 dark:focus:ring-white/20 transition-all duration-300 min-h-[160px] resize-none text-zinc-900 dark:text-zinc-100"
                placeholder="Enter product description"
              />
              {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <Input label="Price (CNY)" type="number" step="0.01" {...register('factory_price_cny', { valueAsNumber: true })} placeholder="0.00" />
            </div>
          </div>
          
          <div className="space-y-4 flex flex-col h-full">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 ml-1">Product Image</label>
            <div className="flex-1 min-h-[300px] rounded-[2rem] border-2 border-dashed border-zinc-200 dark:border-zinc-700 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-800/20 relative group overflow-hidden">
              <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center">
                  <ImageIcon className="text-zinc-500 dark:text-zinc-400 mb-2" size={32} />
                  <p className="text-sm text-zinc-500">Upload Image</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" loading={isUploading}>
            <Save size={18} className="mr-2" />
            {initialData ? 'Save Changes' : 'Create Product'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

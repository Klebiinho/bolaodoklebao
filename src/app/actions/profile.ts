'use server';

import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  
  const avatar_url = formData.get('avatar_url') as string;
  const favorite_team = formData.get('favorite_team') as string;
  
  const updates: any = {};
  if (avatar_url !== null) updates.avatar_url = avatar_url;
  if (favorite_team !== null) updates.favorite_team = favorite_team;

  const { error } = await supabase.auth.updateUser({
    data: updates
  });

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath('/', 'layout');
  return { success: true };
}

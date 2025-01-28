import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { authStore } from '$lib/stores/auth';
import { get } from 'svelte/store';

export const load: LayoutLoad = async ({ url }) => {
  const user = get(authStore).user;

  // If not authenticated, redirect to login
  if (!user) {
    throw redirect(303, `/login?redirect=${url.pathname}`);
  }

  return {
    user
  };
}; 
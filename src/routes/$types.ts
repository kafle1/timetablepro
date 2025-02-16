import type { User } from '$lib/types';

export interface LayoutLoad {
    ({ url }: { url: URL }): Promise<{
        user: User | null;
    }>;
} 
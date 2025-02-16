<script lang="ts">
    export let type: 'login' | 'register' = 'login';
    export let className = '';
</script>

<div class="w-full max-w-md mx-auto {className}">
    {#if type === 'login'}
    <svg class="w-full h-auto" viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Background Shape -->
        <path 
            d="M0 198.78c0 41.458 14.945 79.235 39.539 107.786 28.214 32.765 69.128 53.365 114.734 53.365a148.44 148.44 0 0056.495-11.036c7.919-3.256 15.416-7.223 22.441-11.82 20.576-13.166 37.935-31.152 50.02-52.388 11.732-20.523 18.456-44.046 18.456-68.872 0-78.461-63.896-142.023-142.762-142.023S0 120.319 0 198.78z" 
            fill="#4F46E5" 
            opacity="0.1"
        />
        
        <!-- Calendar Grid -->
        <rect x="140" y="80" width="240" height="220" rx="8" fill="white" stroke="#4F46E5" stroke-width="2"/>
        <line x1="140" y1="120" x2="380" y2="120" stroke="#4F46E5" stroke-width="1"/>
        <line x1="200" y1="80" x2="200" y2="300" stroke="#4F46E5" stroke-width="1"/>
        <line x1="260" y1="80" x2="260" y2="300" stroke="#4F46E5" stroke-width="1"/>
        <line x1="320" y1="80" x2="320" y2="300" stroke="#4F46E5" stroke-width="1"/>
        
        <!-- Time Slots -->
        <rect x="205" y="130" width="50" height="30" rx="4" fill="#4F46E5" opacity="0.2"/>
        <rect x="265" y="170" width="50" height="30" rx="4" fill="#4F46E5" opacity="0.2"/>
        <rect x="325" y="210" width="50" height="30" rx="4" fill="#4F46E5" opacity="0.2"/>
        
        <!-- Decorative Elements -->
        <circle cx="420" cy="100" r="20" fill="#4F46E5" opacity="0.1"/>
        <circle cx="60" cy="200" r="30" fill="#4F46E5" opacity="0.1"/>
        <circle cx="380" cy="280" r="25" fill="#4F46E5" opacity="0.1"/>
    </svg>
    {:else}
    <svg class="w-full h-auto" viewBox="0 0 480 360" fill="none" xmlns="http://www.w3.org/2000/svg">
        <!-- Background Shape -->
        <path 
            d="M480 198.78c0 41.458-14.945 79.235-39.539 107.786-28.214 32.765-69.128 53.365-114.734 53.365a148.44 148.44 0 01-56.495-11.036c-7.919-3.256-15.416-7.223-22.441-11.82-20.576-13.166-37.935-31.152-50.02-52.388C185.039 264.162 178.315 240.639 178.315 215.813c0-78.461 63.896-142.023 142.762-142.023S480 120.319 480 198.78z" 
            fill="#4F46E5" 
            opacity="0.1"
        />
        
        <!-- Form Elements -->
        <rect x="140" y="80" width="240" height="220" rx="8" fill="white" stroke="#4F46E5" stroke-width="2"/>
        <rect x="160" y="110" width="200" height="32" rx="4" fill="#4F46E5" opacity="0.1"/>
        <rect x="160" y="160" width="200" height="32" rx="4" fill="#4F46E5" opacity="0.1"/>
        <rect x="160" y="210" width="200" height="32" rx="4" fill="#4F46E5" opacity="0.1"/>
        
        <!-- Checkmark -->
        <circle cx="240" cy="270" r="20" fill="#4F46E5" opacity="0.2"/>
        <path d="M230 270l8 8 16-16" stroke="#4F46E5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        
        <!-- Decorative Elements -->
        <circle cx="60" cy="120" r="25" fill="#4F46E5" opacity="0.1"/>
        <circle cx="420" cy="200" r="30" fill="#4F46E5" opacity="0.1"/>
        <circle cx="100" cy="280" r="20" fill="#4F46E5" opacity="0.1"/>
    </svg>
    {/if}
</div> 
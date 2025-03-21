<script>
    import { onMount } from 'svelte';
    import { checkAppwriteConnection, getAppwriteSetupInstructions, displayAppwriteConfig } from '$lib/config/appwrite-setup';
    import { DB_CONFIG } from '$lib/config/appwrite';
    import { marked } from 'marked';
    
    let connectionStatus = 'checking';
    let errorMessage = '';
    let showSetupInstructions = false;
    
    // Setup markdown instructions
    const setupInstructionsMarkdown = getAppwriteSetupInstructions();
    const setupInstructionsHtml = marked.parse(setupInstructionsMarkdown);
    
    onMount(async () => {
        try {
            // Check the connection
            const isConnected = await checkAppwriteConnection();
            connectionStatus = isConnected ? 'connected' : 'error';
            
            if (!isConnected) {
                showSetupInstructions = true;
            }
        } catch (error) {
            connectionStatus = 'error';
            errorMessage = error.message || 'Unknown error';
            showSetupInstructions = true;
        }
    });
    
    function toggleSetupInstructions() {
        showSetupInstructions = !showSetupInstructions;
    }
    
    function copyEnvVariables() {
        const envText = `VITE_APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
VITE_APPWRITE_PROJECT_ID="your-project-id"
VITE_APPWRITE_DATABASE_ID="${DB_CONFIG.databaseId}"
VITE_APPWRITE_USERS_COLLECTION_ID="${DB_CONFIG.collections.USERS}"
VITE_APPWRITE_ROOMS_COLLECTION_ID="${DB_CONFIG.collections.ROOMS}"
VITE_APPWRITE_SCHEDULES_COLLECTION_ID="${DB_CONFIG.collections.SCHEDULES}"
VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID="${DB_CONFIG.collections.NOTIFICATIONS}"
VITE_APPWRITE_TEACHER_AVAILABILITY_COLLECTION_ID="${DB_CONFIG.collections.TEACHER_AVAILABILITY}"`;
        
        navigator.clipboard.writeText(envText);
        alert('Environment variables copied to clipboard');
    }
</script>

<svelte:head>
    <title>Appwrite Setup | TimeTablePro</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-6">Appwrite Setup</h1>
    
    <div class="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 class="text-xl font-semibold mb-4">Connection Status</h2>
        
        {#if connectionStatus === 'checking'}
            <div class="flex items-center">
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                <p>Checking connection to Appwrite...</p>
            </div>
        {:else if connectionStatus === 'connected'}
            <div class="bg-green-100 border-l-4 border-green-500 p-4 mb-4">
                <div class="flex items-center">
                    <svg class="h-6 w-6 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <p class="font-semibold">Connected to Appwrite successfully!</p>
                </div>
                <p class="mt-2">Your application is properly configured to use Appwrite.</p>
            </div>
        {:else}
            <div class="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
                <div class="flex items-center">
                    <svg class="h-6 w-6 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                    <p class="font-semibold">Failed to connect to Appwrite</p>
                </div>
                <p class="mt-2">{errorMessage || 'There was an error connecting to your Appwrite instance. Please check your configuration.'}</p>
            </div>
        {/if}
        
        <div class="mt-6">
            <h3 class="text-lg font-semibold mb-2">Current Configuration</h3>
            <div class="bg-gray-100 p-4 rounded">
                <p><strong>Database ID:</strong> {DB_CONFIG.databaseId}</p>
                <div class="mt-2">
                    <p class="font-medium">Collection IDs:</p>
                    <ul class="ml-4 list-disc">
                        {#each Object.entries(DB_CONFIG.collections) as [key, id]}
                            <li><strong>{key}:</strong> {id}</li>
                        {/each}
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="mt-6 flex gap-4">
            <button 
                on:click={toggleSetupInstructions}
                class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md transition duration-200"
            >
                {showSetupInstructions ? 'Hide Setup Instructions' : 'Show Setup Instructions'}
            </button>
            
            <button 
                on:click={copyEnvVariables}
                class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition duration-200"
            >
                Copy Environment Variables
            </button>
        </div>
    </div>
    
    {#if showSetupInstructions}
        <div class="bg-white p-6 rounded-lg shadow-md mt-8">
            <h2 class="text-xl font-semibold mb-4">Setup Instructions</h2>
            <div class="prose max-w-none">
                {@html setupInstructionsHtml}
            </div>
        </div>
    {/if}
</div>

<style>
    :global(.prose h1) {
        font-size: 1.875rem;
        font-weight: 700;
        margin-top: 2rem;
        margin-bottom: 1rem;
    }
    
    :global(.prose h2) {
        font-size: 1.5rem;
        font-weight: 600;
        margin-top: 1.75rem;
        margin-bottom: 0.75rem;
    }
    
    :global(.prose h3) {
        font-size: 1.25rem;
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.5rem;
    }
    
    :global(.prose p) {
        margin-bottom: 1rem;
    }
    
    :global(.prose ul) {
        list-style-type: disc;
        margin-left: 1.5rem;
        margin-bottom: 1rem;
    }
    
    :global(.prose li) {
        margin-bottom: 0.25rem;
    }
    
    :global(.prose code) {
        background-color: #f1f1f1;
        padding: 0.1rem 0.25rem;
        border-radius: 0.25rem;
        font-family: monospace;
    }
    
    :global(.prose pre) {
        background-color: #f1f1f1;
        padding: 1rem;
        border-radius: 0.25rem;
        overflow-x: auto;
        margin-bottom: 1rem;
    }
    
    :global(.prose pre code) {
        background-color: transparent;
        padding: 0;
    }
</style> 
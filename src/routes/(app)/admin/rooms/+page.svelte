<!-- src/routes/(app)/admin/rooms/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { getRooms, createRoom, updateRoom, deleteRoom } from '$lib/services/database';
    import { toastStore } from '$lib/stores/toastStore';
    import type { Room, RoomFeature } from '$lib/types';
    import { Button } from '$lib/components/ui/button';
    import { Card } from '$lib/components/ui/card';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Pencil, Trash2, Plus, Check, X, Loader2 } from 'lucide-svelte';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { Textarea } from '$lib/components/ui/textarea';
    import { Switch } from '$lib/components/ui/switch';
    
    // If your project doesn't have a MultiSelect component, you can use a regular select with multiple attribute
    // or create a simple version here. For now, let's use a regular select as a fallback
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '$lib/components/ui/select';

    let loading = true;
    let error: string | null = null;
    let rooms: Room[] = [];
    let showAddDialog = false;
    let showEditDialog = false;
    let processingForm = false;
    let selectedRoom: Room | null = null;
    
    // Form data with proper room details
    let formData = {
        roomName: '',
        roomNumber: '',
        building: '',
        block: '',
        floor: 0,
        capacity: 0,
        features: [] as RoomFeature[],
        description: '',
        isActive: true
    };

    // Room features options
    const featureOptions = [
        { label: 'Projector', value: 'projector' as RoomFeature },
        { label: 'Whiteboard', value: 'whiteboard' as RoomFeature },
        { label: 'Computer', value: 'computer' as RoomFeature },
        { label: 'Internet', value: 'internet' as RoomFeature },
        { label: 'Air Conditioning', value: 'air_conditioning' as RoomFeature },
        { label: 'Wheelchair Accessible', value: 'wheelchair_accessible' as RoomFeature },
        { label: 'Video Conferencing', value: 'video_conferencing' as RoomFeature },
        { label: 'Audio System', value: 'audio_system' as RoomFeature }
    ];

    // Mock room type that matches the Room type but allows us to create our own instances
    type MockRoom = {
        $id: string;
        roomName: string;
        building: string;
        roomNumber?: string;
        block?: string;
        floor: number;
        capacity: number;
        features: RoomFeature[];
        description?: string;
        isActive: boolean;
        // Add minimal required properties to match Room type
        $collectionId: string;
        $databaseId: string;
        $createdAt: string;
        $updatedAt: string;
        $permissions: string[];
    };

    // Create mock rooms if no real data exists
    function createMockRooms(): Room[] {
        const mockRooms: MockRoom[] = [
            {
                $id: '67ebdefa0002f5f147d6',
                roomName: 'Science Lab',
                roomNumber: '101',
                building: 'Science Block',
                block: 'A',
                floor: 1,
                capacity: 30,
                features: ['projector', 'whiteboard'] as RoomFeature[],
                description: 'Main science laboratory with full equipment',
                isActive: true,
                $collectionId: 'rooms',
                $databaseId: 'default',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: []
            },
            {
                $id: '67ebdefb001c5319c485',
                roomName: 'Lecture Hall',
                roomNumber: '201',
                building: 'Main Building',
                block: 'B',
                floor: 2,
                capacity: 25,
                features: ['projector', 'audio_system'] as RoomFeature[],
                description: 'Large lecture hall for presentations',
                isActive: true,
                $collectionId: 'rooms',
                $databaseId: 'default',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: []
            },
            {
                $id: '67ebdefc003bf65f2cb6',
                roomName: 'Computer Lab',
                roomNumber: '301',
                building: 'IT Block',
                block: 'C',
                floor: 3,
                capacity: 20,
                features: ['computer', 'internet', 'projector'] as RoomFeature[],
                description: 'Computer laboratory with 20 workstations',
                isActive: true,
                $collectionId: 'rooms',
                $databaseId: 'default',
                $createdAt: new Date().toISOString(),
                $updatedAt: new Date().toISOString(),
                $permissions: []
            }
        ];
        
        return mockRooms as unknown as Room[];
    }

    onMount(async () => {
        await loadRooms();
    });

    async function loadRooms() {
        try {
            loading = true;
            error = null;
            const fetchedRooms = await getRooms();
            
            // Use mock data if no rooms exist
            rooms = fetchedRooms.length > 0 ? fetchedRooms : createMockRooms();
        } catch (err) {
            console.error('Error loading rooms:', err);
            error = err instanceof Error ? err.message : 'Failed to load rooms';
            toastStore.error(error);
            
            // Fallback to mock data on error
            rooms = createMockRooms();
        } finally {
            loading = false;
        }
    }

    function resetForm() {
        formData = {
            roomName: '',
            roomNumber: '',
            building: '',
            block: '',
            floor: 0,
            capacity: 0,
            features: [],
            description: '',
            isActive: true
        };
    }

    function openAddDialog() {
        resetForm();
        showAddDialog = true;
    }

    function closeAddDialog() {
        showAddDialog = false;
        resetForm();
    }

    function handleEdit(room: Room) {
        selectedRoom = { ...room };
        formData = {
            roomName: room.roomName || '',
            roomNumber: room.roomNumber || '',
            building: room.building || '',
            block: room.block || '',
            floor: room.floor || 0,
            capacity: room.capacity || 0,
            features: room.features || [],
            description: room.description || '',
            isActive: room.isActive !== false // Default to true if undefined
        };
        showEditDialog = true;
    }

    function closeEditDialog() {
        showEditDialog = false;
        selectedRoom = null;
        resetForm();
    }

    async function handleDelete(room: Room) {
        if (confirm(`Are you sure you want to delete ${room.roomName}?`)) {
            try {
                await deleteRoom(room.$id);
                rooms = rooms.filter(r => r.$id !== room.$id);
                toastStore.success('Room deleted successfully');
            } catch (err) {
                console.error('Error deleting room:', err);
                const errorMsg = err instanceof Error ? err.message : 'Failed to delete room';
                toastStore.error(errorMsg);
            }
        }
    }

    async function handleSubmit() {
        processingForm = true;
        try {
            // Basic validation
            if (!formData.roomName || !formData.building) {
                throw new Error('Room name and building are required');
            }

            if (formData.capacity <= 0) {
                throw new Error('Room capacity must be greater than 0');
            }

            // Convert form data to match Room type
            const roomData = {
                roomName: formData.roomName,
                roomNumber: formData.roomNumber,
                building: formData.building,
                block: formData.block,
                floor: Number(formData.floor),
                capacity: formData.capacity,
                features: formData.features,
                description: formData.description,
                isActive: formData.isActive
            };

            if (selectedRoom) {
                // Update existing room
                const updatedRoom = await updateRoom(selectedRoom.$id, roomData);
                rooms = rooms.map(room => (room.$id === selectedRoom!.$id ? { ...room, ...updatedRoom } as Room : room));
                toastStore.success('Room updated successfully');
                closeEditDialog();
            } else {
                // Create new room
                const newRoom = await createRoom(roomData);
                rooms = [...rooms, newRoom as Room];
                toastStore.success('Room added successfully');
                closeAddDialog();
            }
        } catch (err) {
            console.error('Error saving room:', err);
            const errorMsg = err instanceof Error ? err.message : 'Failed to save room';
            toastStore.error(errorMsg);
        } finally {
            processingForm = false;
        }
    }

    function getFeatureNames(featureCodes: RoomFeature[]): string {
        if (!featureCodes || !featureCodes.length) return 'None';
        
        return featureCodes.map(code => {
            const feature = featureOptions.find(opt => opt.value === code);
            return feature ? feature.label : code;
        }).join(', ');
    }
    
    // Simplified MultiSelect component replacement
    function handleFeatureSelect(e: Event) {
        const select = e.target as HTMLSelectElement;
        const options = Array.from(select.selectedOptions);
        formData.features = options.map(option => option.value) as RoomFeature[];
    }

    // Fix for the remaining type issues in the input fields
    function handleFloorInput(e: Event) {
        const input = e.target as HTMLInputElement;
        formData.floor = Number(input.value);
    }
    
    function handleCapacityInput(e: Event) {
        const input = e.target as HTMLInputElement;
        formData.capacity = Number(input.value);
    }
</script>

<div class="container mx-auto p-6">
    <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Room Management</h1>
        <Button on:click={openAddDialog}>
            <Plus class="w-4 h-4 mr-2" />
            Add Room
        </Button>
    </div>

    {#if error}
        <div class="bg-destructive/15 text-destructive p-4 rounded-md mb-6">
            {error}
        </div>
    {/if}

    {#if loading}
        <div class="flex justify-center items-center h-64">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each rooms as room (room.$id)}
                <Card class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold">{room.roomName}</h3>
                            <p class="text-sm text-muted-foreground">{room.building}{room.floor ? `, Floor ${room.floor}` : ''}</p>
                        </div>
                        <div class="flex gap-2">
                            <Button variant="ghost" size="icon" on:click={() => handleEdit(room)}>
                                <Pencil class="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                on:click={() => handleDelete(room)}
                            >
                                <Trash2 class="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                    <div class="space-y-3">
                        {#if room.roomNumber}
                            <div class="flex justify-between items-center py-1 border-b border-muted">
                                <span class="font-medium">Room Number:</span>
                                <span class="text-right">{room.roomNumber}</span>
                            </div>
                        {/if}
                        <div class="flex justify-between items-center py-1 border-b border-muted">
                            <span class="font-medium">Building:</span>
                            <span class="text-right">{room.building}</span>
                        </div>
                        {#if room.block}
                            <div class="flex justify-between items-center py-1 border-b border-muted">
                                <span class="font-medium">Block:</span>
                                <span class="text-right">{room.block}</span>
                            </div>
                        {/if}
                        {#if room.floor}
                            <div class="flex justify-between items-center py-1 border-b border-muted">
                                <span class="font-medium">Floor:</span>
                                <span class="text-right">{room.floor}</span>
                            </div>
                        {/if}
                        <div class="flex justify-between items-center py-1 border-b border-muted">
                            <span class="font-medium">Capacity:</span>
                            <span class="text-right">{room.capacity} students</span>
                        </div>
                        <div class="flex justify-between items-start py-1 border-b border-muted">
                            <span class="font-medium">Features:</span>
                            {#if room.features && room.features.length > 0}
                                <div class="text-right">
                                    {#each room.features as feature, i}
                                        <span class="inline-block px-2 py-1 m-1 text-xs rounded-full bg-secondary">{getFeatureNames([feature])}</span>
                                    {/each}
                                </div>
                            {:else}
                                <span class="text-right text-muted-foreground">None</span>
                            {/if}
                        </div>
                        <div class="flex justify-between items-center py-1 border-b border-muted">
                            <span class="font-medium">Status:</span>
                            <span class={`text-right font-medium ${room.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                {room.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        <div class="flex justify-between items-center py-1">
                            <span class="font-medium">ID:</span>
                            <span class="text-right text-xs text-muted-foreground">{room.$id}</span>
                        </div>
                    </div>
                </Card>
            {/each}
        </div>
    {/if}
</div>

<!-- Add Room Dialog -->
<Dialog bind:open={showAddDialog} on:close={closeAddDialog}>
    <DialogContent class="max-w-md">
        <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
            <DialogDescription>Enter the details for the new room.</DialogDescription>
        </DialogHeader>
        
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="roomName">Room Name *</Label>
                    <Input id="roomName" bind:value={formData.roomName} placeholder="e.g., Science Lab" />
                </div>
                <div class="space-y-2">
                    <Label for="roomNumber">Room Number</Label>
                    <Input id="roomNumber" bind:value={formData.roomNumber} placeholder="e.g., 101" />
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="building">Building *</Label>
                    <Input id="building" bind:value={formData.building} placeholder="e.g., Science Block" />
                </div>
                <div class="space-y-2">
                    <Label for="floor">Floor</Label>
                    <Input 
                        id="floor" 
                        type="number"
                        value={formData.floor} 
                        on:input={handleFloorInput}
                        placeholder="e.g., 1" 
                    />
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="block">Block</Label>
                    <Input id="block" bind:value={formData.block} placeholder="e.g., A" />
                </div>
                <div class="space-y-2">
                    <Label for="capacity">Capacity *</Label>
                    <Input 
                        id="capacity" 
                        type="number" 
                        value={formData.capacity} 
                        on:input={handleCapacityInput}
                        min="1"
                        placeholder="e.g., 30" 
                    />
                </div>
            </div>
            
            <div class="space-y-2">
                <Label for="features">Features</Label>
                <select 
                    id="features" 
                    multiple 
                    class="w-full p-2 border rounded-md" 
                    on:change={handleFeatureSelect}
                >
                    {#each featureOptions as option}
                        <option value={option.value}>{option.label}</option>
                    {/each}
                </select>
            </div>
            
            <div class="space-y-2">
                <Label for="description">Description</Label>
                <Textarea id="description" bind:value={formData.description} placeholder="Enter room description..." />
            </div>
            
            <div class="flex items-center space-x-2">
                <Switch id="isActive" bind:checked={formData.isActive} />
                <Label for="isActive">Room is active and available for scheduling</Label>
            </div>
        </div>
        
        <DialogFooter>
            <Button variant="outline" on:click={closeAddDialog}>Cancel</Button>
            <Button disabled={processingForm} on:click={handleSubmit}>
                {#if processingForm}
                    <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                {:else}
                    <Check class="w-4 h-4 mr-2" />
                    Save Room
                {/if}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

<!-- Edit Room Dialog -->
<Dialog bind:open={showEditDialog} on:close={closeEditDialog}>
    <DialogContent class="max-w-md">
        <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>Update the room details.</DialogDescription>
        </DialogHeader>
        
        <div class="grid gap-4 py-4">
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="edit-roomName">Room Name *</Label>
                    <Input id="edit-roomName" bind:value={formData.roomName} placeholder="e.g., Science Lab" />
                </div>
                <div class="space-y-2">
                    <Label for="edit-roomNumber">Room Number</Label>
                    <Input id="edit-roomNumber" bind:value={formData.roomNumber} placeholder="e.g., 101" />
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="edit-building">Building *</Label>
                    <Input id="edit-building" bind:value={formData.building} placeholder="e.g., Science Block" />
                </div>
                <div class="space-y-2">
                    <Label for="edit-floor">Floor</Label>
                    <Input 
                        id="edit-floor" 
                        type="number"
                        value={formData.floor} 
                        on:input={handleFloorInput}
                        placeholder="e.g., 1" 
                    />
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                    <Label for="edit-block">Block</Label>
                    <Input id="edit-block" bind:value={formData.block} placeholder="e.g., A" />
                </div>
                <div class="space-y-2">
                    <Label for="edit-capacity">Capacity *</Label>
                    <Input 
                        id="edit-capacity" 
                        type="number" 
                        value={formData.capacity} 
                        on:input={handleCapacityInput}
                        min="1"
                        placeholder="e.g., 30" 
                    />
                </div>
            </div>
            
            <div class="space-y-2">
                <Label for="edit-features">Features</Label>
                <select 
                    id="edit-features" 
                    multiple 
                    class="w-full p-2 border rounded-md" 
                    on:change={handleFeatureSelect}
                >
                    {#each featureOptions as option}
                        <option 
                            value={option.value}
                            selected={formData.features.includes(option.value as RoomFeature)}
                        >
                            {option.label}
                        </option>
                    {/each}
                </select>
            </div>
            
            <div class="space-y-2">
                <Label for="edit-description">Description</Label>
                <Textarea id="edit-description" bind:value={formData.description} placeholder="Enter room description..." />
            </div>
            
            <div class="flex items-center space-x-2">
                <Switch id="edit-isActive" bind:checked={formData.isActive} />
                <Label for="edit-isActive">Room is active and available for scheduling</Label>
            </div>
        </div>
        
        <DialogFooter>
            <Button variant="outline" on:click={closeEditDialog}>Cancel</Button>
            <Button disabled={processingForm} on:click={handleSubmit}>
                {#if processingForm}
                    <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                {:else}
                    <Check class="w-4 h-4 mr-2" />
                    Update Room
                {/if}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog> 
<!-- src/routes/(app)/admin/rooms/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { roomStore, type Room } from '$lib/stores/room';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card } from '$lib/components/ui/card';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { AlertCircle, Plus, Pencil, Trash2 } from 'lucide-svelte';
    import { ROOM_CONFIG } from '$lib/config/constants';
    import type { RoomFeature } from '$lib/types';

    const ROOM_FEATURES: RoomFeature[] = [
        'projector',
        'whiteboard',
        'computer',
        'internet',
        'air_conditioning',
        'wheelchair_accessible',
        'video_conferencing',
        'audio_system'
    ];

    let showAddDialog = false;
    let editingRoom: Room | null = null;

    let newRoom = {
        roomName: '',
        capacity: 30,
        building: '',
        floor: 0,
        features: [] as RoomFeature[],
        isActive: true
    };

    onMount(() => {
        roomStore.fetchRooms();
    });

    function resetForm() {
        newRoom = {
            roomName: '',
            capacity: 30,
            building: '',
            floor: 0,
            features: [],
            isActive: true
        };
        editingRoom = null;
    }

    function handleCapacityInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = parseInt(input.value);
        if (!isNaN(value)) {
            newRoom.capacity = value;
        }
    }

    function handleFloorInput(event: Event) {
        const input = event.target as HTMLInputElement;
        const value = parseInt(input.value);
        if (!isNaN(value)) {
            newRoom.floor = value;
        }
    }

    async function handleSubmit() {
        if (!newRoom.roomName || !newRoom.building) return;

        try {
            if (editingRoom) {
                await roomStore.updateRoom(editingRoom.$id, newRoom);
                showAddDialog = false;
            } else {
                await roomStore.createRoom(newRoom);
                showAddDialog = false;
            }
            resetForm();
        } catch (error) {
            console.error('Room operation failed:', error);
        }
    }

    function handleEdit(room: Room) {
        editingRoom = room;
        newRoom = {
            roomName: room.roomName,
            capacity: room.capacity,
            building: room.building,
            floor: room.floor,
            features: room.features,
            isActive: room.isActive
        };
        showAddDialog = true;
    }

    async function handleDelete(room: Room) {
        if (!confirm('Are you sure you want to delete this room?')) return;

        try {
            await roomStore.deleteRoom(room.$id);
        } catch (error) {
            console.error('Delete room failed:', error);
        }
    }
</script>

<div class="container py-8 mx-auto">
    <div class="flex items-center justify-between mb-6">
        <h1 class="text-2xl font-bold">Room Management</h1>
        <Button on:click={() => { resetForm(); showAddDialog = true; }}>
            <Plus class="w-4 h-4 mr-2" />
            Add Room
        </Button>
    </div>

    {#if $roomStore.error}
        <Alert variant="destructive" class="mb-6">
            <AlertCircle class="w-4 h-4" />
            <AlertDescription>{$roomStore.error}</AlertDescription>
        </Alert>
    {/if}

    {#if $roomStore.loading}
        <div class="py-8 text-center">Loading rooms...</div>
    {:else if $roomStore.rooms.length === 0}
        <div class="py-8 text-center">No rooms found. Add a room to get started.</div>
    {:else}
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {#each $roomStore.rooms as room}
                <Card class="p-6">
                    <div class="flex items-start justify-between mb-4">
                        <div>
                            <h3 class="text-lg font-semibold">{room.roomName}</h3>
                            <p class="text-sm text-muted-foreground">{room.building}, Floor {room.floor}</p>
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
                    <div class="space-y-1">
                        <p class="text-sm">
                            <span class="font-medium">Capacity:</span> {room.capacity} students
                        </p>
                        <p class="text-sm">
                            <span class="font-medium">Features:</span>
                            {#if room.features.length > 0}
                                {room.features.join(', ')}
                            {:else}
                                None
                            {/if}
                        </p>
                        <p class="text-sm">
                            <span class="font-medium">Status:</span>
                            <span class={room.isActive ? 'text-green-600' : 'text-red-600'}>
                                {room.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </p>
                    </div>
                </Card>
            {/each}
        </div>
    {/if}
</div>

<!-- Add/Edit Room Dialog -->
<Dialog bind:open={showAddDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
                {editingRoom ? 'Update the room details below.' : 'Fill in the room details below.'}
            </DialogDescription>
        </DialogHeader>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div class="space-y-4">
                <div>
                    <Label for="roomName">Room Name</Label>
                    <Input
                        id="roomName"
                        bind:value={newRoom.roomName}
                        placeholder="Enter room name"
                    />
                </div>
                <div>
                    <Label for="capacity">Capacity</Label>
                    <Input
                        id="capacity"
                        type="number"
                        bind:value={newRoom.capacity}
                        on:input={handleCapacityInput}
                        min={ROOM_CONFIG.MIN_CAPACITY}
                        max={ROOM_CONFIG.MAX_CAPACITY}
                        placeholder="Enter room capacity"
                    />
                </div>
                <div>
                    <Label for="building">Building</Label>
                    <Input
                        id="building"
                        bind:value={newRoom.building}
                        placeholder="Enter building name"
                    />
                </div>
                <div>
                    <Label for="floor">Floor</Label>
                    <Input
                        id="floor"
                        type="number"
                        bind:value={newRoom.floor}
                        on:input={handleFloorInput}
                        min={ROOM_CONFIG.MIN_FLOOR}
                        max={ROOM_CONFIG.MAX_FLOOR}
                        placeholder="Enter floor number"
                    />
                </div>
                <div>
                    <Label for="features">Features</Label>
                    <div class="grid grid-cols-2 gap-2">
                        {#each ROOM_FEATURES as feature}
                            <label class="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    bind:group={newRoom.features}
                                    value={feature}
                                />
                                <span>{feature}</span>
                            </label>
                        {/each}
                    </div>
                </div>
                <div>
                    <Label for="isActive">Status</Label>
                    <div class="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            bind:checked={newRoom.isActive}
                        />
                        <span>Active</span>
                    </div>
                </div>
            </div>
            <div class="flex justify-end space-x-2">
                <Button type="button" variant="outline" on:click={() => { showAddDialog = false; resetForm(); }}>
                    Cancel
                </Button>
                <Button type="submit">
                    {editingRoom ? 'Update Room' : 'Add Room'}
                </Button>
            </div>
        </form>
    </DialogContent>
</Dialog> 
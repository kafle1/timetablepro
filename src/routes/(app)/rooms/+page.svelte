<!-- src/routes/(app)/rooms/+page.svelte -->
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
    import { hasPermission, PERMISSIONS } from '$lib/utils/roles';
    import { authStore } from '$lib/stores/auth';

    let loading = false;
    let showAddDialog = false;
    let showEditDialog = false;
    let showDeleteDialog = false;
    let selectedRoom: Room | null = null;

    let formData = {
        name: '',
        capacity: 0,
        building: '',
        floor: '',
        is_available: true
    };

    $: userRole = $authStore.user?.prefs?.userRole || 'student';
    $: canManageRooms = hasPermission(userRole, PERMISSIONS.MANAGE_ROOMS);

    onMount(() => {
        roomStore.fetchRooms();
    });

    function resetForm() {
        formData = {
            name: '',
            capacity: 0,
            building: '',
            floor: '',
            is_available: true
        };
        selectedRoom = null;
    }

    async function handleSubmit() {
        if (!formData.name || !formData.building || !formData.floor) return;

        loading = true;
        try {
            if (selectedRoom) {
                await roomStore.updateRoom(selectedRoom.$id, formData);
                showEditDialog = false;
            } else {
                await roomStore.createRoom(formData);
                showAddDialog = false;
            }
            resetForm();
        } catch (error) {
            console.error('Room operation failed:', error);
        } finally {
            loading = false;
        }
    }

    function handleEdit(room: Room) {
        selectedRoom = room;
        formData = {
            name: room.name,
            capacity: room.capacity,
            building: room.building,
            floor: room.floor,
            is_available: room.is_available
        };
        showEditDialog = true;
    }

    async function handleDelete() {
        if (!selectedRoom) return;

        loading = true;
        try {
            await roomStore.deleteRoom(selectedRoom.$id);
            showDeleteDialog = false;
            selectedRoom = null;
        } catch (error) {
            console.error('Delete room failed:', error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-8">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Rooms</h1>
            <p class="text-muted-foreground mt-2">Manage classroom assignments and availability</p>
        </div>
        {#if canManageRooms}
            <Button on:click={() => { resetForm(); showAddDialog = true; }}>
                <Plus class="w-4 h-4 mr-2" />
                Add Room
            </Button>
        {/if}
    </div>

    {#if $roomStore.error}
        <Alert variant="destructive" class="mb-8">
            <AlertCircle class="w-4 h-4" />
            <AlertDescription>{$roomStore.error}</AlertDescription>
        </Alert>
    {/if}

    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {#each $roomStore.rooms as room}
            <Card class="p-6">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="text-lg font-semibold">{room.name}</h3>
                        <p class="text-sm text-muted-foreground">{room.building}, Floor {room.floor}</p>
                    </div>
                    {#if canManageRooms}
                        <div class="flex gap-2">
                            <Button variant="ghost" size="icon" on:click={() => handleEdit(room)}>
                                <Pencil class="w-4 h-4" />
                            </Button>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                on:click={() => { selectedRoom = room; showDeleteDialog = true; }}
                            >
                                <Trash2 class="w-4 h-4" />
                            </Button>
                        </div>
                    {/if}
                </div>
                <div class="space-y-1">
                    <p class="text-sm">
                        <span class="font-medium">Capacity:</span> {room.capacity} students
                    </p>
                    <p class="text-sm">
                        <span class="font-medium">Status:</span>
                        <span class={room.is_available ? 'text-green-600' : 'text-red-600'}>
                            {room.is_available ? 'Available' : 'Not Available'}
                        </span>
                    </p>
                </div>
            </Card>
        {/each}
    </div>
</div>

<!-- Add Room Dialog -->
<Dialog bind:open={showAddDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Add Room</DialogTitle>
            <DialogDescription>
                Fill in the room details below.
            </DialogDescription>
        </DialogHeader>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div class="grid gap-4">
                <div class="grid gap-2">
                    <Label for="name">Room Name</Label>
                    <Input
                        id="name"
                        bind:value={formData.name}
                        required
                        placeholder="e.g., Room 101"
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="capacity">Capacity</Label>
                    <Input
                        id="capacity"
                        type="number"
                        bind:value={formData.capacity}
                        required
                        min="1"
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="building">Building</Label>
                    <Input
                        id="building"
                        bind:value={formData.building}
                        required
                        placeholder="e.g., Main Building"
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="floor">Floor</Label>
                    <Input
                        id="floor"
                        bind:value={formData.floor}
                        required
                        placeholder="e.g., Ground Floor"
                    />
                </div>
                <div class="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="is_available"
                        bind:checked={formData.is_available}
                        class="w-4 h-4"
                    />
                    <Label for="is_available">Available for scheduling</Label>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" on:click={() => showAddDialog = false}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
</Dialog>

<!-- Edit Room Dialog -->
<Dialog bind:open={showEditDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Edit Room</DialogTitle>
            <DialogDescription>
                Update the room details below.
            </DialogDescription>
        </DialogHeader>
        <form on:submit|preventDefault={handleSubmit} class="space-y-4">
            <div class="grid gap-4">
                <div class="grid gap-2">
                    <Label for="edit_name">Room Name</Label>
                    <Input
                        id="edit_name"
                        bind:value={formData.name}
                        required
                        placeholder="e.g., Room 101"
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="edit_capacity">Capacity</Label>
                    <Input
                        id="edit_capacity"
                        type="number"
                        bind:value={formData.capacity}
                        required
                        min="1"
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="edit_building">Building</Label>
                    <Input
                        id="edit_building"
                        bind:value={formData.building}
                        required
                        placeholder="e.g., Main Building"
                    />
                </div>
                <div class="grid gap-2">
                    <Label for="edit_floor">Floor</Label>
                    <Input
                        id="edit_floor"
                        bind:value={formData.floor}
                        required
                        placeholder="e.g., Ground Floor"
                    />
                </div>
                <div class="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="edit_is_available"
                        bind:checked={formData.is_available}
                        class="w-4 h-4"
                    />
                    <Label for="edit_is_available">Available for scheduling</Label>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" on:click={() => showEditDialog = false}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? 'Saving...' : 'Save'}
                </Button>
            </DialogFooter>
        </form>
    </DialogContent>
</Dialog>

<!-- Delete Confirmation Dialog -->
<Dialog bind:open={showDeleteDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
                Are you sure you want to delete {selectedRoom?.name}? This action cannot be undone.
            </DialogDescription>
        </DialogHeader>
        <DialogFooter>
            <Button variant="outline" on:click={() => showDeleteDialog = false}>
                Cancel
            </Button>
            <Button variant="destructive" on:click={handleDelete} disabled={loading}>
                {loading ? 'Deleting...' : 'Delete'}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog> 
<!-- src/routes/rooms/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authStore } from '$lib/stores/auth';
    import { getRooms, createRoom, updateRoom, deleteRoom, getRoomTypes, getBuildings, type Room, type RoomData } from '$lib/services/room';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '$lib/components/ui/dialog';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';

    let rooms: Room[] = [];
    let roomTypes: string[] = [];
    let buildings: string[] = [];
    let loading = true;
    let error: string | null = null;
    let showDialog = false;

    // Form data
    let formData: Partial<RoomData> = {
        name: '',
        capacity: 0,
        type: '',
        building: ''
    };

    // Filters
    let selectedType = '';
    let selectedBuilding = '';

    let editingRoomId: string | null = null;

    onMount(async () => {
        try {
            const [roomsData, typesData, buildingsData] = await Promise.all([
                getRooms(),
                getRoomTypes(),
                getBuildings()
            ]);
            rooms = roomsData;
            roomTypes = typesData;
            buildings = buildingsData;
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            }
        } finally {
            loading = false;
        }
    });

    async function handleSubmit() {
        try {
            if (!formData.name || !formData.type || !formData.building || formData.capacity === undefined) {
                error = 'Please fill in all required fields';
                return;
            }

            if (formData.capacity < 0) {
                error = 'Capacity must be a positive number';
                return;
            }

            if (editingRoomId) {
                await updateRoom(editingRoomId, formData);
            } else {
                await createRoom(formData as RoomData);
            }

            // Refresh rooms
            rooms = await getRooms({ type: selectedType, building: selectedBuilding });
            showDialog = false;
            resetForm();
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            }
        }
    }

    async function handleDelete(roomId: string) {
        if (confirm('Are you sure you want to delete this room?')) {
            try {
                await deleteRoom(roomId);
                rooms = rooms.filter(r => r.$id !== roomId);
            } catch (e) {
                if (e instanceof Error) {
                    error = e.message;
                }
            }
        }
    }

    function editRoom(room: Room) {
        editingRoomId = room.$id;
        formData = {
            name: room.name,
            capacity: room.capacity,
            type: room.type,
            building: room.building
        };
        showDialog = true;
    }

    function resetForm() {
        formData = {
            name: '',
            capacity: 0,
            type: '',
            building: ''
        };
        editingRoomId = null;
        error = null;
    }

    async function applyFilters() {
        try {
            loading = true;
            rooms = await getRooms({
                type: selectedType,
                building: selectedBuilding
            });
        } catch (e) {
            if (e instanceof Error) {
                error = e.message;
            }
        } finally {
            loading = false;
        }
    }

    function clearFilters() {
        selectedType = '';
        selectedBuilding = '';
        applyFilters();
    }
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold">Rooms</h1>
        {#if $authStore.user?.role === 'admin'}
            <Dialog bind:open={showDialog} on:close={resetForm}>
                <DialogTrigger asChild let:builder>
                    <Button builders={[builder]}>
                        {editingRoomId ? 'Edit Room' : 'Add Room'}
                    </Button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingRoomId ? 'Edit Room' : 'Add New Room'}</DialogTitle>
                        <DialogDescription>
                            Fill in the room details below
                        </DialogDescription>
                    </DialogHeader>

                    <form class="space-y-4" on:submit|preventDefault={handleSubmit}>
                        <div class="space-y-2">
                            <Label for="name">Room Name</Label>
                            <Input
                                id="name"
                                bind:value={formData.name}
                                placeholder="Enter room name"
                                required
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="capacity">Capacity</Label>
                            <Input
                                id="capacity"
                                type="number"
                                min="1"
                                bind:value={formData.capacity}
                                placeholder="Enter room capacity"
                                required
                            />
                        </div>

                        <div class="space-y-2">
                            <Label for="type">Room Type</Label>
                            <select
                                id="type"
                                class="w-full px-3 py-2 border rounded-md"
                                bind:value={formData.type}
                                required
                            >
                                <option value="">Select a type</option>
                                {#each roomTypes as type}
                                    <option value={type}>{type}</option>
                                {/each}
                                <option value="other">Other</option>
                            </select>
                        </div>

                        <div class="space-y-2">
                            <Label for="building">Building</Label>
                            <select
                                id="building"
                                class="w-full px-3 py-2 border rounded-md"
                                bind:value={formData.building}
                                required
                            >
                                <option value="">Select a building</option>
                                {#each buildings as building}
                                    <option value={building}>{building}</option>
                                {/each}
                                <option value="other">Other</option>
                            </select>
                        </div>

                        {#if error}
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        {/if}

                        <DialogFooter>
                            <Button type="submit">
                                {editingRoomId ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        {/if}
    </div>

    <Card>
        <CardHeader>
            <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="space-y-2">
                    <Label for="filterType">Room Type</Label>
                    <select
                        id="filterType"
                        class="w-full px-3 py-2 border rounded-md"
                        bind:value={selectedType}
                        on:change={applyFilters}
                    >
                        <option value="">All Types</option>
                        {#each roomTypes as type}
                            <option value={type}>{type}</option>
                        {/each}
                    </select>
                </div>

                <div class="space-y-2">
                    <Label for="filterBuilding">Building</Label>
                    <select
                        id="filterBuilding"
                        class="w-full px-3 py-2 border rounded-md"
                        bind:value={selectedBuilding}
                        on:change={applyFilters}
                    >
                        <option value="">All Buildings</option>
                        {#each buildings as building}
                            <option value={building}>{building}</option>
                        {/each}
                    </select>
                </div>

                <div class="flex items-end">
                    <Button variant="outline" on:click={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            </div>
        </CardContent>
    </Card>

    {#if loading}
        <div class="text-center py-8">Loading rooms...</div>
    {:else if rooms.length === 0}
        <div class="text-center py-8 text-muted-foreground">
            No rooms found. {#if $authStore.user?.role === 'admin'}Add a room to get started.{/if}
        </div>
    {:else}
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {#each rooms as room}
                <Card>
                    <CardHeader>
                        <CardTitle>{room.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="space-y-2">
                            <div class="flex justify-between">
                                <span class="text-muted-foreground">Capacity:</span>
                                <span>{room.capacity} students</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-muted-foreground">Type:</span>
                                <span>{room.type}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-muted-foreground">Building:</span>
                                <span>{room.building}</span>
                            </div>
                            {#if $authStore.user?.role === 'admin'}
                                <div class="flex gap-2 mt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        class="flex-1"
                                        on:click={() => editRoom(room)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        class="flex-1"
                                        on:click={() => handleDelete(room.$id)}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            {/if}
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>
    {/if}
</div> 
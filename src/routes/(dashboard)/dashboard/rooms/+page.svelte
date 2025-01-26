<!-- src/routes/(dashboard)/dashboard/rooms/+page.svelte -->
<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Search, Plus, Pencil, Trash2 } from 'lucide-svelte';
    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow,
    } from '$lib/components/ui/table';

    // Mock data - replace with actual data from your Appwrite database
    const rooms = [
        { id: '1', name: 'Room 101', capacity: 30, type: 'Classroom', building: 'A' },
        { id: '2', name: 'Room 203', capacity: 25, type: 'Lab', building: 'B' },
        { id: '3', name: 'Room 305', capacity: 40, type: 'Lecture Hall', building: 'C' },
    ];

    let searchQuery = '';

    function handleAddRoom() {
        // Implement room addition logic
        console.log('Add room clicked');
    }

    function handleEditRoom(id: string) {
        // Implement room edit logic
        console.log('Edit room:', id);
    }

    function handleDeleteRoom(id: string) {
        // Implement room deletion logic
        console.log('Delete room:', id);
    }

    $: filteredRooms = rooms.filter(room =>
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.building.toLowerCase().includes(searchQuery.toLowerCase())
    );
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Rooms</h1>
            <p class="text-muted-foreground">Manage classrooms and facilities.</p>
        </div>
        <Button on:click={handleAddRoom}>
            <Plus class="mr-2 h-4 w-4" />
            Add Room
        </Button>
    </div>

    <div class="flex items-center space-x-2">
        <div class="relative flex-1">
            <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search rooms..."
                class="pl-8"
                bind:value={searchQuery}
            />
        </div>
    </div>

    <div class="border rounded-lg">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Building</TableHead>
                    <TableHead class="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {#each filteredRooms as room}
                    <TableRow>
                        <TableCell>{room.name}</TableCell>
                        <TableCell>{room.capacity}</TableCell>
                        <TableCell>{room.type}</TableCell>
                        <TableCell>Building {room.building}</TableCell>
                        <TableCell>
                            <div class="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    on:click={() => handleEditRoom(room.id)}
                                >
                                    <Pencil class="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    on:click={() => handleDeleteRoom(room.id)}
                                >
                                    <Trash2 class="h-4 w-4" />
                                </Button>
                            </div>
                        </TableCell>
                    </TableRow>
                {/each}
            </TableBody>
        </Table>
    </div>
</div> 
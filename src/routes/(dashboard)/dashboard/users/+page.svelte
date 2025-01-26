<!-- src/routes/(dashboard)/dashboard/users/+page.svelte -->
<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
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
    const users = [
        { id: '1', name: 'John Doe', email: 'john@example.com', role: 'teacher' },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'student' },
        { id: '3', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
    ];

    let searchQuery = '';

    function handleAddUser() {
        // Implement user addition logic
        console.log('Add user clicked');
    }

    function handleEditUser(id: string) {
        // Implement user edit logic
        console.log('Edit user:', id);
    }

    function handleDeleteUser(id: string) {
        // Implement user deletion logic
        console.log('Delete user:', id);
    }

    $: filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );
</script>

<div class="space-y-6">
    <div class="flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold tracking-tight">Users</h1>
            <p class="text-muted-foreground">Manage system users and their roles.</p>
        </div>
        <Button on:click={handleAddUser}>
            <Plus class="mr-2 h-4 w-4" />
            Add User
        </Button>
    </div>

    <div class="flex items-center space-x-2">
        <div class="relative flex-1">
            <Search class="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                placeholder="Search users..."
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
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead class="w-[100px]">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {#each filteredUsers as user}
                    <TableRow>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                            <span class="capitalize">{user.role}</span>
                        </TableCell>
                        <TableCell>
                            <div class="flex items-center space-x-2">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    on:click={() => handleEditUser(user.id)}
                                >
                                    <Pencil class="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    on:click={() => handleDeleteUser(user.id)}
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
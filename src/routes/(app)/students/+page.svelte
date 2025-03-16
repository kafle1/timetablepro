<!-- src/routes/(app)/students/+page.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    import { authService } from '$lib/services/auth';
    import { userStore } from '$lib/stores/userStore';
    import type { User } from '$lib/types';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card } from '$lib/components/ui/card';
    import { Alert, AlertDescription } from '$lib/components/ui/alert';
    import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '$lib/components/ui/dialog';
    import { Loader2, Search, UserPlus, UserX, Edit, Mail, Shield } from 'lucide-svelte';
    import { USER_ROLES } from '$lib/config/constants';

    let students: User[] = [];
    let loading = false;
    let error: string | null = null;
    let searchQuery = '';
    let filteredStudents: User[] = [];
    
    // Dialog states
    let showAddDialog = false;
    let showEditDialog = false;
    let showDeleteDialog = false;
    let selectedStudent: User | null = null;
    
    // Form states
    let newStudentName = '';
    let newStudentEmail = '';
    let newStudentPassword = '';
    let editStudentName = '';
    let editStudentEmail = '';
    let editStudentPassword = '';
    let formError: string | null = null;
    let formLoading = false;

    onMount(async () => {
        await loadStudents();
    });

    async function loadStudents() {
        try {
            loading = true;
            error = null;
            
            // Check if user has permission
            if (!$userStore.user || $userStore.user.role !== USER_ROLES.ADMIN) {
                error = 'You do not have permission to view this page';
                return;
            }
            
            students = await authService.getStudents();
            applySearch();
        } catch (err: any) {
            console.error('Error loading students:', err);
            error = err.message || 'Failed to load students';
        } finally {
            loading = false;
        }
    }

    function applySearch() {
        if (!searchQuery) {
            filteredStudents = [...students];
            return;
        }
        
        const query = searchQuery.toLowerCase();
        filteredStudents = students.filter(student => 
            student.name.toLowerCase().includes(query) || 
            student.email.toLowerCase().includes(query)
        );
    }

    function handleSearchInput() {
        applySearch();
    }

    async function handleAddStudent() {
        try {
            formLoading = true;
            formError = null;
            
            if (!newStudentName || !newStudentEmail || !newStudentPassword) {
                formError = 'All fields are required';
                return;
            }
            
            await authService.register(
                newStudentEmail,
                newStudentPassword,
                newStudentName,
                'STUDENT'
            );
            
            // Reset form and reload students
            newStudentName = '';
            newStudentEmail = '';
            newStudentPassword = '';
            showAddDialog = false;
            
            await loadStudents();
        } catch (err: any) {
            console.error('Error adding student:', err);
            formError = err.message || 'Failed to add student';
        } finally {
            formLoading = false;
        }
    }

    function openEditDialog(student: User) {
        selectedStudent = student;
        editStudentName = student.name;
        editStudentEmail = student.email;
        editStudentPassword = '';
        showEditDialog = true;
    }

    async function handleEditStudent() {
        try {
            if (!selectedStudent) return;
            
            formLoading = true;
            formError = null;
            
            if (!editStudentName) {
                formError = 'Name is required';
                return;
            }
            
            const updateData: any = {
                name: editStudentName
            };
            
            if (editStudentPassword) {
                updateData.password = editStudentPassword;
            }
            
            await authService.updateUser(selectedStudent.$id, updateData);
            
            // Reset form and reload students
            showEditDialog = false;
            selectedStudent = null;
            
            await loadStudents();
        } catch (err: any) {
            console.error('Error updating student:', err);
            formError = err.message || 'Failed to update student';
        } finally {
            formLoading = false;
        }
    }

    function openDeleteDialog(student: User) {
        selectedStudent = student;
        showDeleteDialog = true;
    }

    async function handleDeleteStudent() {
        try {
            if (!selectedStudent) return;
            
            formLoading = true;
            formError = null;
            
            await authService.deleteUser(selectedStudent.$id);
            
            // Reset form and reload students
            showDeleteDialog = false;
            selectedStudent = null;
            
            await loadStudents();
        } catch (err: any) {
            console.error('Error deleting student:', err);
            formError = err.message || 'Failed to delete student';
        } finally {
            formLoading = false;
        }
    }
</script>

<div class="container py-6 space-y-6">
    <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold tracking-tight">Students</h1>
        <Button on:click={() => showAddDialog = true} class="gap-2">
            <UserPlus class="w-4 h-4" />
            Add Student
        </Button>
    </div>

    {#if error}
        <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    {/if}

    <div class="flex items-center space-x-2">
        <div class="relative flex-1">
            <Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search students..."
                class="pl-8"
                bind:value={searchQuery}
                on:input={handleSearchInput}
            />
        </div>
    </div>

    {#if loading}
        <div class="flex items-center justify-center py-8">
            <Loader2 class="w-8 h-8 animate-spin text-primary" />
        </div>
    {:else if filteredStudents.length === 0}
        <div class="py-8 text-center text-muted-foreground">
            {searchQuery ? 'No students found matching your search' : 'No students found'}
        </div>
    {:else}
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each filteredStudents as student (student.$id)}
                <Card class="p-4">
                    <div class="flex items-start justify-between">
                        <div>
                            <h3 class="text-lg font-medium">{student.name}</h3>
                            <div class="flex items-center mt-1 text-sm text-muted-foreground">
                                <Mail class="h-3.5 w-3.5 mr-1" />
                                {student.email}
                            </div>
                            <div class="flex items-center mt-2">
                                <Shield class="h-3.5 w-3.5 mr-1 text-blue-500" />
                                <span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded dark:bg-blue-800 dark:text-blue-100">
                                    Student
                                </span>
                            </div>
                        </div>
                        <div class="flex space-x-1">
                            <Button variant="ghost" size="icon" on:click={() => openEditDialog(student)}>
                                <Edit class="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" on:click={() => openDeleteDialog(student)}>
                                <UserX class="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            {/each}
        </div>
    {/if}
</div>

<!-- Add Student Dialog -->
<Dialog bind:open={showAddDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
                Create a new student account. The student will receive an email to set up their account.
            </DialogDescription>
        </DialogHeader>
        
        {#if formError}
            <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
            </Alert>
        {/if}
        
        <div class="space-y-4">
            <div class="space-y-2">
                <Label for="name">Full Name</Label>
                <Input id="name" bind:value={newStudentName} placeholder="John Doe" />
            </div>
            
            <div class="space-y-2">
                <Label for="email">Email</Label>
                <Input id="email" type="email" bind:value={newStudentEmail} placeholder="john.doe@example.com" />
            </div>
            
            <div class="space-y-2">
                <Label for="password">Password</Label>
                <Input id="password" type="password" bind:value={newStudentPassword} placeholder="••••••••" />
                <p class="text-xs text-muted-foreground">
                    Password must be at least 8 characters and include uppercase, lowercase, numbers, and special characters.
                </p>
            </div>
        </div>
        
        <DialogFooter>
            <Button variant="outline" on:click={() => showAddDialog = false}>Cancel</Button>
            <Button on:click={handleAddStudent} disabled={formLoading}>
                {#if formLoading}
                    <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                {:else}
                    Add Student
                {/if}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

<!-- Edit Student Dialog -->
<Dialog bind:open={showEditDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Edit Student</DialogTitle>
            <DialogDescription>
                Update student information.
            </DialogDescription>
        </DialogHeader>
        
        {#if formError}
            <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
            </Alert>
        {/if}
        
        <div class="space-y-4">
            <div class="space-y-2">
                <Label for="edit-name">Full Name</Label>
                <Input id="edit-name" bind:value={editStudentName} />
            </div>
            
            <div class="space-y-2">
                <Label for="edit-email">Email</Label>
                <Input id="edit-email" type="email" value={editStudentEmail} disabled />
                <p class="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
            
            <div class="space-y-2">
                <Label for="edit-password">New Password (optional)</Label>
                <Input id="edit-password" type="password" bind:value={editStudentPassword} placeholder="Leave blank to keep current password" />
            </div>
        </div>
        
        <DialogFooter>
            <Button variant="outline" on:click={() => showEditDialog = false}>Cancel</Button>
            <Button on:click={handleEditStudent} disabled={formLoading}>
                {#if formLoading}
                    <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                {:else}
                    Save Changes
                {/if}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>

<!-- Delete Student Dialog -->
<Dialog bind:open={showDeleteDialog}>
    <DialogContent>
        <DialogHeader>
            <DialogTitle>Delete Student</DialogTitle>
            <DialogDescription>
                Are you sure you want to delete this student? This action cannot be undone.
            </DialogDescription>
        </DialogHeader>
        
        {#if formError}
            <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
            </Alert>
        {/if}
        
        {#if selectedStudent}
            <div class="p-3 rounded-md bg-muted">
                <div class="font-medium">{selectedStudent.name}</div>
                <div class="text-sm text-muted-foreground">{selectedStudent.email}</div>
            </div>
        {/if}
        
        <DialogFooter>
            <Button variant="outline" on:click={() => showDeleteDialog = false}>Cancel</Button>
            <Button variant="destructive" on:click={handleDeleteStudent} disabled={formLoading}>
                {#if formLoading}
                    <Loader2 class="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                {:else}
                    Delete Student
                {/if}
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog> 
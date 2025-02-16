import { writable, get } from 'svelte/store';
import { databases, DB_CONFIG } from '$lib/config/appwrite';
import type { Models } from 'appwrite';
import { ID, Query } from 'appwrite';
import type { Room } from '$lib/services/room';
import { createRoomNotification } from '$lib/services/notification';
import { authStore } from './auth';

// Define the room data type without Document properties
type RoomData = Omit<Room, keyof Models.Document>;

interface RoomState {
    rooms: Room[];
    loading: boolean;
    error: string | null;
}

function createRoomStore() {
    const { subscribe, set, update } = writable<RoomState>({
        rooms: [],
        loading: false,
        error: null
    });

    return {
        subscribe,
        fetchRooms: async (filters: string[] = []) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.ROOMS
                );
                set({ rooms: response.documents as Room[], loading: false, error: null });
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch rooms'
                }));
                throw error;
            }
        },
        createRoom: async (room: RoomData) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const documentId = ID.unique();
                const response = await databases.createDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.ROOMS,
                    documentId,
                    room
                );

                const newRoom = response as Room;
                const currentUser = get(authStore).user;
                if (currentUser) {
                    await createRoomNotification(
                        currentUser.$id,
                        newRoom,
                        'created'
                    );
                }

                update(state => ({
                    rooms: [...state.rooms, newRoom],
                    loading: false,
                    error: null
                }));
                return newRoom;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to create room'
                }));
                throw error;
            }
        },
        updateRoom: async (roomId: string, room: Partial<RoomData>) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.updateDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.ROOMS,
                    roomId,
                    room
                );

                const updatedRoom = response as Room;
                const currentUser = get(authStore).user;
                if (currentUser) {
                    const action = 'availability' in room ? 'availability_changed' : 'updated';
                    await createRoomNotification(
                        currentUser.$id,
                        updatedRoom,
                        action
                    );
                }

                update(state => ({
                    rooms: state.rooms.map(r => 
                        r.$id === roomId ? updatedRoom : r
                    ),
                    loading: false,
                    error: null
                }));
                return updatedRoom;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to update room'
                }));
                throw error;
            }
        },
        deleteRoom: async (roomId: string) => {
            try {
                const currentState = get(roomStore);
                const room = currentState.rooms.find(r => r.$id === roomId);
                const currentUser = get(authStore).user;
                
                if (room && currentUser) {
                    await createRoomNotification(
                        currentUser.$id,
                        room,
                        'deleted'
                    );
                }

                update(state => ({ ...state, loading: true, error: null }));
                await databases.deleteDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.ROOMS,
                    roomId
                );

                update(state => ({
                    rooms: state.rooms.filter(r => r.$id !== roomId),
                    loading: false,
                    error: null
                }));
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete room'
                }));
                throw error;
            }
        },
        getAvailableRooms: async () => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.ROOMS
                );
                const availableRooms = response.documents.filter(doc => doc.availability === true) as Room[];
                return availableRooms;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch available rooms'
                }));
                throw error;
            }
        }
    };
}

export const roomStore = createRoomStore(); 
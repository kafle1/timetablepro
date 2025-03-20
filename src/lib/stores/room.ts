import { writable, get } from 'svelte/store';
import { databases } from '$lib/config/appwrite';
import { DB_CONFIG } from '$lib/config/appwrite';
import { ID, Query } from 'appwrite';
import type { Room } from '$lib/types';
import type { Models } from 'appwrite';

// Room state type
interface RoomState {
    rooms: Room[];
    loading: boolean;
    error: string | null;
}

// Create room store
function createRoomStore() {
    const { subscribe, set, update } = writable<RoomState>({
        rooms: [],
        loading: false,
        error: null
    });

    return {
        subscribe,
        fetchRooms: async () => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const response = await databases.listDocuments(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.ROOMS
                );
                set({ rooms: response.documents as Room[], loading: false, error: null });
                return response.documents;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to fetch rooms'
                }));
                throw error;
            }
        },
        getRoomById: (roomId: string) => {
            const state = get(roomStore);
            return state.rooms.find(room => room.$id === roomId);
        },
        createRoom: async (roomData: Partial<Room>) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const newRoom = await databases.createDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.ROOMS,
                    ID.unique(),
                    roomData
                );
                
                update(state => ({
                    rooms: [...state.rooms, newRoom as Room],
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
        updateRoom: async (id: string, roomData: Partial<Room>) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                const updatedRoom = await databases.updateDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.ROOMS,
                    id,
                    roomData
                );
                
                update(state => ({
                    rooms: state.rooms.map(room => 
                        room.$id === id ? { ...room, ...updatedRoom } as Room : room
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
        deleteRoom: async (id: string) => {
            try {
                update(state => ({ ...state, loading: true, error: null }));
                await databases.deleteDocument(
                    DB_CONFIG.databaseId,
                    DB_CONFIG.collections.ROOMS,
                    id
                );
                
                update(state => ({
                    rooms: state.rooms.filter(room => room.$id !== id),
                    loading: false,
                    error: null
                }));
                
                return true;
            } catch (error) {
                update(state => ({
                    ...state,
                    loading: false,
                    error: error instanceof Error ? error.message : 'Failed to delete room'
                }));
                throw error;
            }
        }
    };
}

export const roomStore = createRoomStore(); 
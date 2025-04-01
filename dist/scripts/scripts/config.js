"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB_CONFIG = exports.databases = void 0;
var node_appwrite_1 = require("node-appwrite");
var dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables
dotenv_1.default.config();
// Initialize Appwrite client
var client = new node_appwrite_1.Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT || '')
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID || '')
    .setKey(process.env.APPWRITE_API_KEY || '');
// Initialize Databases service
exports.databases = new node_appwrite_1.Databases(client);
// Database and collection configuration
exports.DB_CONFIG = {
    databaseId: process.env.VITE_APPWRITE_DATABASE_ID || '',
    collections: {
        USERS: process.env.VITE_APPWRITE_USERS_COLLECTION_ID || '',
        ROOMS: process.env.VITE_APPWRITE_ROOMS_COLLECTION_ID || '',
        SCHEDULES: process.env.VITE_APPWRITE_SCHEDULES_COLLECTION_ID || '',
        NOTIFICATIONS: process.env.VITE_APPWRITE_NOTIFICATIONS_COLLECTION_ID || '',
        TEACHER_AVAILABILITY: process.env.VITE_APPWRITE_TEACHER_AVAILABILITY_COLLECTION_ID || ''
    }
};

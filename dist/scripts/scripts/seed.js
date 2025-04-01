"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var node_appwrite_1 = require("node-appwrite");
var config_1 = require("./config");
var constants_1 = require("../src/lib/config/constants");
// Helper function to delay execution
var delay = function (ms) { return new Promise(function (resolve) { return setTimeout(resolve, ms); }); };
// Constants
var DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
var TIME_SLOTS = [
    { start: '08:00', end: '09:30' },
    { start: '09:45', end: '11:15' },
    { start: '11:30', end: '13:00' },
    { start: '14:00', end: '15:30' },
    { start: '15:45', end: '17:15' }
];
// Demo account data
var DEMO_ACCOUNTS = [
    {
        email: 'admin@timetablepro.com',
        name: 'Admin User',
        role: 'ADMIN'
    },
    {
        email: 'teacher@timetablepro.com',
        name: 'Teacher User',
        role: 'TEACHER'
    },
    {
        email: 'student@timetablepro.com',
        name: 'Student User',
        role: 'STUDENT'
    }
];
// Dummy teacher data
var DUMMY_TEACHERS = [
    {
        name: 'John Smith',
        email: 'john.smith@timetablepro.com',
        role: 'TEACHER',
        subjects: ['Mathematics', 'Physics']
    },
    {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@timetablepro.com',
        role: 'TEACHER',
        subjects: ['Chemistry', 'Biology']
    }
];
// Dummy student data
var DUMMY_STUDENTS = [
    {
        name: 'Emma Wilson',
        email: 'emma.wilson@timetablepro.com',
        role: 'STUDENT',
        grade: '10',
        section: 'A'
    },
    {
        name: 'David Lee',
        email: 'david.lee@timetablepro.com',
        role: 'STUDENT',
        grade: '10',
        section: 'B'
    }
];
// Dummy room data
var DUMMY_ROOMS = [
    {
        name: 'Room 101',
        capacity: 30,
        floor: 1,
        building: 'Main Building',
        features: ['Projector', 'Whiteboard']
    },
    {
        name: 'Room 102',
        capacity: 25,
        floor: 1,
        building: 'Main Building',
        features: ['Whiteboard']
    },
    {
        name: 'Lab 201',
        capacity: 20,
        floor: 2,
        building: 'Science Block',
        features: ['Lab Equipment', 'Whiteboard']
    }
];
function createAdminUser() {
    return __awaiter(this, void 0, void 0, function () {
        var adminUser, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, config_1.users.create(node_appwrite_1.ID.unique(), 'admin@timetablepro.com', '+1234567890', 'Admin@123', 'Admin User')];
                case 1:
                    adminUser = _a.sent();
                    return [4 /*yield*/, config_1.databases.createDocument(config_1.DB_CONFIG.databaseId, config_1.DB_CONFIG.collections.USERS, node_appwrite_1.ID.unique(), {
                            userId: adminUser.$id,
                            email: adminUser.email,
                            name: adminUser.name,
                            role: constants_1.USER_ROLES.ADMIN,
                            isActive: true
                        })];
                case 2:
                    _a.sent();
                    console.log('Admin user created successfully');
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    if (error_1.code === 409) {
                        console.log('Admin user already exists');
                    }
                    else {
                        console.error('Error creating admin user:', error_1);
                    }
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
function createTeachers() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, _a, _b, index, teacher, user, error_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _i = 0, _a = DUMMY_TEACHERS.entries();
                    _c.label = 1;
                case 1:
                    if (!(_i < _a.length)) return [3 /*break*/, 9];
                    _b = _a[_i], index = _b[0], teacher = _b[1];
                    _c.label = 2;
                case 2:
                    _c.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, delay(1000)];
                case 3:
                    _c.sent(); // Add delay to avoid rate limiting
                    return [4 /*yield*/, config_1.users.create(node_appwrite_1.ID.unique(), teacher.email, "+1234567".concat(index + 891), 'Teacher@123', teacher.name)];
                case 4:
                    user = _c.sent();
                    return [4 /*yield*/, delay(1000)];
                case 5:
                    _c.sent(); // Add delay to avoid rate limiting
                    return [4 /*yield*/, config_1.databases.createDocument(config_1.DB_CONFIG.databaseId, config_1.DB_CONFIG.collections.USERS, node_appwrite_1.ID.unique(), {
                            userId: user.$id,
                            email: user.email,
                            name: user.name,
                            role: constants_1.USER_ROLES.TEACHER,
                            isActive: true,
                            emailVerified: true,
                            preferences: {
                                subjects: teacher.subjects
                            }
                        })];
                case 6:
                    _c.sent();
                    console.log("Teacher ".concat(teacher.name, " created successfully"));
                    return [3 /*break*/, 8];
                case 7:
                    error_2 = _c.sent();
                    if (error_2.code === 409) {
                        console.log("Teacher ".concat(teacher.name, " already exists"));
                    }
                    else {
                        console.error("Error creating teacher ".concat(teacher.name, ":"), error_2);
                    }
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
function createRooms() {
    return __awaiter(this, void 0, void 0, function () {
        var _i, DUMMY_ROOMS_1, room, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _i = 0, DUMMY_ROOMS_1 = DUMMY_ROOMS;
                    _a.label = 1;
                case 1:
                    if (!(_i < DUMMY_ROOMS_1.length)) return [3 /*break*/, 7];
                    room = DUMMY_ROOMS_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    return [4 /*yield*/, delay(1000)];
                case 3:
                    _a.sent(); // Add delay to avoid rate limiting
                    return [4 /*yield*/, config_1.databases.createDocument(config_1.DB_CONFIG.databaseId, config_1.DB_CONFIG.collections.ROOMS, node_appwrite_1.ID.unique(), room)];
                case 4:
                    _a.sent();
                    console.log("Room ".concat(room.name, " created successfully"));
                    return [3 /*break*/, 6];
                case 5:
                    error_3 = _a.sent();
                    if (error_3.code === 409) {
                        console.log("Room ".concat(room.name, " already exists"));
                    }
                    else {
                        console.error("Error creating room ".concat(room.name, ":"), error_3);
                    }
                    return [3 /*break*/, 6];
                case 6:
                    _i++;
                    return [3 /*break*/, 1];
                case 7: return [2 /*return*/];
            }
        });
    });
}
function createTeacherAvailability() {
    return __awaiter(this, void 0, void 0, function () {
        var teachers, _i, _a, teacher, _b, DAYS_OF_WEEK_1, day, _c, TIME_SLOTS_1, timeSlot, error_4, error_5;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 13, , 14]);
                    return [4 /*yield*/, config_1.databases.listDocuments(config_1.DB_CONFIG.databaseId, config_1.DB_CONFIG.collections.USERS, [node_appwrite_1.Query.equal('role', constants_1.USER_ROLES.TEACHER)])];
                case 1:
                    teachers = _d.sent();
                    _i = 0, _a = teachers.documents;
                    _d.label = 2;
                case 2:
                    if (!(_i < _a.length)) return [3 /*break*/, 12];
                    teacher = _a[_i];
                    _b = 0, DAYS_OF_WEEK_1 = DAYS_OF_WEEK;
                    _d.label = 3;
                case 3:
                    if (!(_b < DAYS_OF_WEEK_1.length)) return [3 /*break*/, 11];
                    day = DAYS_OF_WEEK_1[_b];
                    _c = 0, TIME_SLOTS_1 = TIME_SLOTS;
                    _d.label = 4;
                case 4:
                    if (!(_c < TIME_SLOTS_1.length)) return [3 /*break*/, 10];
                    timeSlot = TIME_SLOTS_1[_c];
                    return [4 /*yield*/, delay(500)];
                case 5:
                    _d.sent(); // Add delay to avoid rate limiting
                    _d.label = 6;
                case 6:
                    _d.trys.push([6, 8, , 9]);
                    return [4 /*yield*/, config_1.databases.createDocument(config_1.DB_CONFIG.databaseId, config_1.DB_CONFIG.collections.TEACHER_AVAILABILITY, node_appwrite_1.ID.unique(), {
                            teacherId: teacher.$id,
                            dayOfWeek: day,
                            startTime: timeSlot.start,
                            endTime: timeSlot.end,
                            isAvailable: true
                        })];
                case 7:
                    _d.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_4 = _d.sent();
                    if (error_4.code !== 409) {
                        throw error_4;
                    }
                    return [3 /*break*/, 9];
                case 9:
                    _c++;
                    return [3 /*break*/, 4];
                case 10:
                    _b++;
                    return [3 /*break*/, 3];
                case 11:
                    _i++;
                    return [3 /*break*/, 2];
                case 12:
                    console.log('Teacher availability created successfully');
                    return [3 /*break*/, 14];
                case 13:
                    error_5 = _d.sent();
                    console.error('Error creating teacher availability:', error_5);
                    return [3 /*break*/, 14];
                case 14: return [2 /*return*/];
            }
        });
    });
}
function createSchedules() {
    return __awaiter(this, void 0, void 0, function () {
        var teachers, rooms, _loop_1, _i, _a, teacher, error_6;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 8]);
                    return [4 /*yield*/, config_1.databases.listDocuments(config_1.DB_CONFIG.databaseId, config_1.DB_CONFIG.collections.USERS, [node_appwrite_1.Query.equal('role', constants_1.USER_ROLES.TEACHER)])];
                case 1:
                    teachers = _b.sent();
                    return [4 /*yield*/, config_1.databases.listDocuments(config_1.DB_CONFIG.databaseId, config_1.DB_CONFIG.collections.ROOMS)];
                case 2:
                    rooms = _b.sent();
                    _loop_1 = function (teacher) {
                        var subject, classInfo, _c, DAYS_OF_WEEK_2, day, timeSlot, room, error_7;
                        return __generator(this, function (_d) {
                            switch (_d.label) {
                                case 0:
                                    subject = teacher.subject;
                                    classInfo = SAMPLE_CLASSES.find(function (c) { return c.subject === subject; });
                                    if (!classInfo) return [3 /*break*/, 7];
                                    _c = 0, DAYS_OF_WEEK_2 = DAYS_OF_WEEK;
                                    _d.label = 1;
                                case 1:
                                    if (!(_c < DAYS_OF_WEEK_2.length)) return [3 /*break*/, 7];
                                    day = DAYS_OF_WEEK_2[_c];
                                    return [4 /*yield*/, delay(1000)];
                                case 2:
                                    _d.sent(); // Add delay to avoid rate limiting
                                    timeSlot = TIME_SLOTS[Math.floor(Math.random() * TIME_SLOTS.length)];
                                    room = rooms.documents[Math.floor(Math.random() * rooms.documents.length)];
                                    _d.label = 3;
                                case 3:
                                    _d.trys.push([3, 5, , 6]);
                                    return [4 /*yield*/, config_1.databases.createDocument(config_1.DB_CONFIG.databaseId, config_1.DB_CONFIG.collections.SCHEDULES, node_appwrite_1.ID.unique(), {
                                            className: classInfo.name,
                                            subject: classInfo.subject,
                                            teacherId: teacher.$id,
                                            roomId: room.$id,
                                            startTime: timeSlot.start,
                                            endTime: timeSlot.end,
                                            duration: 90,
                                            dayOfWeek: day,
                                            recurrence: 'weekly',
                                            conflictStatus: 'none'
                                        })];
                                case 4:
                                    _d.sent();
                                    return [3 /*break*/, 6];
                                case 5:
                                    error_7 = _d.sent();
                                    if (error_7.code !== 409) {
                                        throw error_7;
                                    }
                                    return [3 /*break*/, 6];
                                case 6:
                                    _c++;
                                    return [3 /*break*/, 1];
                                case 7: return [2 /*return*/];
                            }
                        });
                    };
                    _i = 0, _a = teachers.documents;
                    _b.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                    teacher = _a[_i];
                    return [5 /*yield**/, _loop_1(teacher)];
                case 4:
                    _b.sent();
                    _b.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6:
                    console.log('Schedules created successfully');
                    return [3 /*break*/, 8];
                case 7:
                    error_6 = _b.sent();
                    console.error('Error creating schedules:', error_6);
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('Starting database seeding...');
                    return [4 /*yield*/, createAdminUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, delay(2000)];
                case 2:
                    _a.sent(); // Add delay between major operations
                    return [4 /*yield*/, createTeachers()];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, delay(2000)];
                case 4:
                    _a.sent(); // Add delay between major operations
                    return [4 /*yield*/, createRooms()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, delay(2000)];
                case 6:
                    _a.sent(); // Add delay between major operations
                    return [4 /*yield*/, createTeacherAvailability()];
                case 7:
                    _a.sent();
                    return [4 /*yield*/, delay(2000)];
                case 8:
                    _a.sent(); // Add delay between major operations
                    return [4 /*yield*/, createSchedules()];
                case 9:
                    _a.sent();
                    console.log('Database seeding completed!');
                    return [2 /*return*/];
            }
        });
    });
}
// Run the seeding process
seedDatabase().catch(console.error);

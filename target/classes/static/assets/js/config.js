const BASE_URL = (window.location.protocol.startsWith('http') ? window.location.origin : 'http://localhost:8080') + '/api';

export const API_ENDPOINTS = {
    STUDENTS: `${BASE_URL}/students`,
    GRADUATION_CONDITIONS: `${BASE_URL}/graduation-conditions`,
    GRADUATION_SESSIONS: `${BASE_URL}/graduation-sessions`,
    GRADUATION_PROFILES: `${BASE_URL}/graduation-profiles`,
    GRADUATION_RESULTS: `${BASE_URL}/graduation-results`,
};

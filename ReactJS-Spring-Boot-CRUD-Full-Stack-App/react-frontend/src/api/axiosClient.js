import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1';

const axiosClient = axios.create({
    baseURL: API_BASE_URL,
});

// Attach the JWT to every outgoing request, if we have one.
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('ems_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// If the server ever tells us the token is no longer valid, clear it and
// send the user back to login rather than showing a confusing error.
axiosClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('ems_token');
            localStorage.removeItem('ems_user');
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

/**
 * Turns an Axios error into a message a user can actually read, instead of
 * "AxiosError" or a raw stack trace. Falls back gracefully when the
 * backend's structured error body isn't present (e.g. network failure).
 */
export function getErrorMessage(error) {
    if (!error.response) {
        return 'Could not reach the server. Please check your connection and try again.';
    }
    const { status, data } = error.response;
    if (data && data.message) {
        if (data.errors && Object.keys(data.errors).length > 0) {
            const fieldMessages = Object.values(data.errors).join(', ');
            return `${data.message}: ${fieldMessages}`;
        }
        return data.message;
    }
    switch (status) {
        case 400: return 'The request was invalid. Please check the form and try again.';
        case 401: return 'You need to log in to do that.';
        case 403: return "You don't have permission to do that.";
        case 404: return 'The requested item could not be found.';
        case 409: return 'This conflicts with existing data.';
        case 500: return 'Something went wrong on the server. Please try again later.';
        default: return 'An unexpected error occurred.';
    }
}

export default axiosClient;

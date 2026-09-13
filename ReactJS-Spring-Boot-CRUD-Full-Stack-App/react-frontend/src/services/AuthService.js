import axiosClient from '../api/axiosClient';

class AuthService {
    login(email, password) {
        return axiosClient.post('/auth/login', { email, password });
    }

    register(name, email, password) {
        return axiosClient.post('/auth/register', { name, email, password });
    }
}

export default new AuthService();

import axiosClient from '../api/axiosClient';

class EmployeeService {
    getEmployees({ page = 0, size = 10, sortBy = 'id', sortDirection = 'ASC' } = {}) {
        return axiosClient.get('/employees', { params: { page, size, sortBy, sortDirection } });
    }

    searchEmployees(keyword, { page = 0, size = 10 } = {}) {
        return axiosClient.get('/employees/search', { params: { keyword, page, size } });
    }

    filterEmployees(filters = {}, { page = 0, size = 10 } = {}) {
        return axiosClient.get('/employees/filter', { params: { ...filters, page, size } });
    }

    getEmployeeById(id) {
        return axiosClient.get(`/employees/${id}`);
    }

    getMyProfile() {
        return axiosClient.get('/employees/me');
    }

    createEmployee(employee) {
        return axiosClient.post('/employees', employee);
    }

    updateEmployee(id, employee) {
        return axiosClient.put(`/employees/${id}`, employee);
    }

    deleteEmployee(id) {
        return axiosClient.delete(`/employees/${id}`);
    }
}

export default new EmployeeService();

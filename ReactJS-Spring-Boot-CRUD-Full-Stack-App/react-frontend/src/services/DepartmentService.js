import axiosClient from '../api/axiosClient';

class DepartmentService {
    getDepartments() {
        return axiosClient.get('/departments');
    }

    getDepartmentById(id) {
        return axiosClient.get(`/departments/${id}`);
    }

    createDepartment(department) {
        return axiosClient.post('/departments', department);
    }

    updateDepartment(id, department) {
        return axiosClient.put(`/departments/${id}`, department);
    }

    deleteDepartment(id) {
        return axiosClient.delete(`/departments/${id}`);
    }
}

export default new DepartmentService();

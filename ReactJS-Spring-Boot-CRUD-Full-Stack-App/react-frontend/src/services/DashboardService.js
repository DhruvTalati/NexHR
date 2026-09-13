import axiosClient from '../api/axiosClient';

class DashboardService {
    getStats() {
        return axiosClient.get('/dashboard/stats');
    }

    getDepartmentSummary() {
        return axiosClient.get('/dashboard/department-summary');
    }
}

export default new DashboardService();

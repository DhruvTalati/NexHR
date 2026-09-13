import axiosClient from "../api/axiosClient";

class AttendanceService {
  checkIn() {
    return axiosClient.post("/attendance/check-in");
  }

  checkOut() {
    return axiosClient.post("/attendance/check-out");
  }

  getTodayAttendance() {
    return axiosClient.get("/attendance/today");
  }

  getMyHistory() {
    return axiosClient.get("/attendance/my-history");
  }

  getMyHistoryByRange(startDate, endDate) {
    return axiosClient.get("/attendance/my-history/range", {
      params: {
        startDate,
        endDate,
      },
    });
  }

  getEmployeeAttendance(employeeId) {
    return axiosClient.get(`/attendance/employee/${employeeId}`);
  }

  getEmployeeAttendanceByRange(employeeId, startDate, endDate) {
    return axiosClient.get(`/attendance/employee/${employeeId}/range`, {
      params: {
        startDate,
        endDate,
      },
    });
  }

  getTodayAllAttendance() {
    return axiosClient.get("/attendance/today/all");
  }

  getTodayCount(status) {
    const params = {};

    if (status) {
      params.status = status;
    }

    return axiosClient.get("/attendance/today/count", { params });
  }

  getDashboardStats() {
    return axiosClient.get("/attendance/dashboard");
  }
}

export default new AttendanceService();

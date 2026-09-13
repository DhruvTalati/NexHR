import axiosClient from "../api/axiosClient";

class LeaveService {
  applyLeave(leaveRequest) {
    return axiosClient.post("/leaves", leaveRequest);
  }

  getMyLeaves() {
    return axiosClient.get("/leaves/my");
  }

  getMyLeave(leaveId) {
    return axiosClient.get(`/leaves/my/${leaveId}`);
  }

  cancelLeave(leaveId) {
    return axiosClient.delete(`/leaves/my/${leaveId}`);
  }

  getAllLeaves() {
    return axiosClient.get("/leaves");
  }

  getPendingLeaves() {
    return axiosClient.get("/leaves/pending");
  }

  approveLeave(leaveId) {
    return axiosClient.put(`/leaves/${leaveId}/approve`);
  }

  rejectLeave(leaveId, reason) {
    return axiosClient.put(`/leaves/${leaveId}/reject`, null, {
      params: {
        reason,
      },
    });
  }

  getDashboard() {
    return axiosClient.get("/leaves/dashboard");
  }

  getMyBalances() {
    return axiosClient.get("/leave-balances/my");
  }

  getMyBalance(leaveType) {
    return axiosClient.get(`/leave-balances/my/${leaveType}`);
  }

  getEmployeeBalances(employeeId) {
    return axiosClient.get(`/leave-balances/employee/${employeeId}`);
  }
}

export default new LeaveService();

import axiosClient from "../api/axiosClient";

class DocumentService {
  uploadDocument(employeeId, file, documentType, expiryDate) {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("documentType", documentType);

    if (expiryDate) {
      formData.append("expiryDate", expiryDate);
    }

    return axiosClient.post(`/employees/${employeeId}/documents`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  getEmployeeDocuments(employeeId) {
    return axiosClient.get(`/employees/${employeeId}/documents`);
  }

  getDocument(documentId) {
    return axiosClient.get(`/documents/${documentId}`);
  }

  downloadDocument(documentId) {
    return axiosClient.get(`/documents/${documentId}/download`, {
      responseType: "blob",
    });
  }

  deleteDocument(documentId) {
    return axiosClient.delete(`/documents/${documentId}`);
  }

  verifyDocument(documentId) {
    return axiosClient.put(`/documents/${documentId}/verify`);
  }

  getMyDocuments() {
    return axiosClient.get("/employees/me/documents");
  }

  downloadMyDocument(documentId) {
    return axiosClient.get(`/documents/${documentId}/my-download`, {
      responseType: "blob",
    });
  }

  rejectDocument(documentId, reason) {
    return axiosClient.put(`/documents/${documentId}/reject`, null, {
      params: {
        reason,
      },
    });
  }
}

export default new DocumentService();

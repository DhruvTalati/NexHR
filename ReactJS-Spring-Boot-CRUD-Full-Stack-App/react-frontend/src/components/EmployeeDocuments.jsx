import React, { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Download,
  FileText,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";

import DocumentService from "../services/DocumentService";
import { getErrorMessage } from "../api/axiosClient";

const DOCUMENT_TYPES = [
  { value: "RESUME", label: "Resume" },
  { value: "AADHAAR", label: "Aadhaar / ID Proof" },
  { value: "PAN", label: "PAN Card" },
  { value: "PASSPORT", label: "Passport" },
  { value: "DRIVING_LICENSE", label: "Driving License" },
  { value: "OFFER_LETTER", label: "Offer Letter" },
  { value: "JOINING_LETTER", label: "Joining Letter" },
  { value: "EXPERIENCE_LETTER", label: "Experience Letter" },
  { value: "SALARY_SLIP", label: "Salary Slip" },
  {
    value: "EDUCATIONAL_CERTIFICATE",
    label: "Educational Certificate",
  },
  { value: "ADDRESS_PROOF", label: "Address Proof" },
  { value: "OTHER", label: "Other" },
];

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    className: "document-status-pending",
  },
  VERIFIED: {
    label: "Verified",
    className: "document-status-verified",
  },
  REJECTED: {
    label: "Rejected",
    className: "document-status-rejected",
  },
};

function formatDocumentType(type) {
  if (!type) {
    return "Document";
  }

  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatFileSize(bytes) {
  if (bytes == null) {
    return "Unknown size";
  }

  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileExtension(filename) {
  if (!filename || !filename.includes(".")) {
    return "FILE";
  }

  return filename.split(".").pop().toUpperCase();
}

export default function EmployeeDocuments({ employeeId }) {
  const fileInputRef = useRef(null);

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentType, setDocumentType] = useState("RESUME");
  const [expiryDate, setExpiryDate] = useState("");
  const [uploading, setUploading] = useState(false);

  const [actionId, setActionId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await DocumentService.getEmployeeDocuments(employeeId);

      setDocuments(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [employeeId]);

  const resetUploadForm = () => {
    setSelectedFile(null);
    setDocumentType("RESUME");
    setExpiryDate("");
    setUploadOpen(false);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Please select a file.");
      return;
    }

    try {
      setUploading(true);
      setError("");

      await DocumentService.uploadDocument(
        employeeId,
        selectedFile,
        documentType,
        expiryDate,
      );

      resetUploadForm();

      await loadDocuments();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (document) => {
    try {
      setActionId(document.id);
      setError("");

      const response = await DocumentService.downloadDocument(document.id);

      const blob = new Blob([response.data], {
        type:
          response.headers["content-type"] ||
          document.contentType ||
          "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);

      const link = window.document.createElement("a");
      link.href = url;
      link.download = document.originalFileName || "document";

      window.document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (documentId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setActionId(documentId);
      setError("");

      await DocumentService.deleteDocument(documentId);

      setDocuments((current) =>
        current.filter((document) => document.id !== documentId),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleVerify = async (documentId) => {
    try {
      setActionId(documentId);
      setError("");

      const response = await DocumentService.verifyDocument(documentId);

      setDocuments((current) =>
        current.map((document) =>
          document.id === documentId ? response.data : document,
        ),
      );
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (event) => {
    event.preventDefault();

    if (!rejectionReason.trim()) {
      return;
    }

    try {
      setActionId(rejectingId);
      setError("");

      const response = await DocumentService.rejectDocument(
        rejectingId,
        rejectionReason.trim(),
      );

      setDocuments((current) =>
        current.map((document) =>
          document.id === rejectingId ? response.data : document,
        ),
      );

      setRejectingId(null);
      setRejectionReason("");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  return (
    <section className="profile-section-card employee-documents-card">
      <div className="profile-section-header document-section-header">
        <div className="profile-section-heading-icon">
          <FileText size={17} />
        </div>

        <div className="document-section-heading-content">
          <h2>Employee Documents</h2>

          <p>Store, review, and manage employee documents.</p>
        </div>

        <button
          type="button"
          className="profile-primary-button document-upload-button"
          onClick={() => setUploadOpen(true)}
        >
          <Upload size={15} />
          Upload Document
        </button>
      </div>

      {error && <div className="document-error-message">{error}</div>}

      {uploadOpen && (
        <form className="document-upload-panel" onSubmit={handleUpload}>
          <div className="document-upload-panel-header">
            <div>
              <h3>Upload Employee Document</h3>
              <p>PDF, JPG, PNG, DOC and DOCX up to 10 MB.</p>
            </div>

            <button
              type="button"
              className="document-close-button"
              onClick={resetUploadForm}
            >
              <XCircle size={18} />
            </button>
          </div>

          <div className="document-upload-grid">
            <div className="document-form-field">
              <label htmlFor="documentType">Document Type</label>

              <select
                id="documentType"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
              >
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="document-form-field">
              <label htmlFor="expiryDate">Expiry Date</label>

              <input
                id="expiryDate"
                type="date"
                value={expiryDate}
                onChange={(event) => setExpiryDate(event.target.value)}
              />
            </div>

            <div className="document-form-field document-file-field">
              <label htmlFor="employeeDocument">File</label>

              <input
                ref={fileInputRef}
                id="employeeDocument"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
              />

              {selectedFile && (
                <div className="document-selected-file">
                  <FileText size={16} />
                  <span>{selectedFile.name}</span>
                  <small>{formatFileSize(selectedFile.size)}</small>
                </div>
              )}
            </div>
          </div>

          <div className="document-upload-actions">
            <button
              type="button"
              className="profile-secondary-button"
              onClick={resetUploadForm}
              disabled={uploading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="profile-primary-button"
              disabled={uploading || !selectedFile}
            >
              <Upload size={15} />

              {uploading ? "Uploading..." : "Upload Document"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="documents-empty-state">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="documents-empty-state">
          <FileText size={30} />

          <h3>No documents yet</h3>

          <p>Upload the employee's first document to get started.</p>
        </div>
      ) : (
        <div className="documents-list">
          {documents.map((document) => {
            const status =
              STATUS_CONFIG[document.status] || STATUS_CONFIG.PENDING;

            const busy = actionId === document.id;

            return (
              <div className="document-item" key={document.id}>
                <div className="document-item-main">
                  <div className="document-file-icon">
                    <FileText size={19} />
                  </div>

                  <div className="document-item-info">
                    <div className="document-item-title-row">
                      <h3>{document.originalFileName}</h3>

                      <span className="document-file-type">
                        {getFileExtension(document.originalFileName)}
                      </span>
                    </div>

                    <div className="document-item-meta">
                      <span>{formatDocumentType(document.documentType)}</span>

                      <span>•</span>

                      <span>{formatFileSize(document.fileSize)}</span>

                      {document.expiryDate && (
                        <>
                          <span>•</span>

                          <span>Expires: {document.expiryDate}</span>
                        </>
                      )}
                    </div>

                    <span
                      className={`document-status-badge ${status.className}`}
                    >
                      {document.status === "VERIFIED" ? (
                        <CheckCircle2 size={13} />
                      ) : document.status === "REJECTED" ? (
                        <XCircle size={13} />
                      ) : (
                        <span className="document-status-dot" />
                      )}

                      {status.label}
                    </span>

                    {document.rejectionReason && (
                      <div className="document-rejection-reason">
                        Rejection reason: {document.rejectionReason}
                      </div>
                    )}
                  </div>
                </div>

                <div className="document-item-actions">
                  <button
                    type="button"
                    className="document-icon-action"
                    title="Download"
                    disabled={busy}
                    onClick={() => handleDownload(document)}
                  >
                    <Download size={16} />
                  </button>

                  {document.status !== "VERIFIED" && (
                    <button
                      type="button"
                      className="document-icon-action document-verify-action"
                      title="Verify"
                      disabled={busy}
                      onClick={() => handleVerify(document.id)}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}

                  {document.status !== "REJECTED" && (
                    <button
                      type="button"
                      className="document-icon-action document-reject-action"
                      title="Reject"
                      disabled={busy}
                      onClick={() => {
                        setRejectingId(document.id);
                        setRejectionReason("");
                      }}
                    >
                      <XCircle size={16} />
                    </button>
                  )}

                  <button
                    type="button"
                    className="document-icon-action document-delete-action"
                    title="Delete"
                    disabled={busy}
                    onClick={() => handleDelete(document.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {rejectingId && (
        <div className="document-reject-panel">
          <form onSubmit={handleReject}>
            <h3>Reject Document</h3>

            <p>Please provide a reason for rejecting this document.</p>

            <textarea
              rows="4"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              placeholder="Enter rejection reason..."
            />

            <div className="document-upload-actions">
              <button
                type="button"
                className="profile-secondary-button"
                onClick={() => {
                  setRejectingId(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="profile-primary-button document-reject-submit"
                disabled={!rejectionReason.trim() || actionId === rejectingId}
              >
                Reject Document
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

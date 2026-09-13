import React, { useEffect, useState } from "react";
import { CheckCircle2, Download, FileText, XCircle } from "lucide-react";

import DocumentService from "../services/DocumentService";
import { getErrorMessage } from "../api/axiosClient";

const STATUS_CONFIG = {
  PENDING: {
    label: "Pending Review",
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

  return String(type)
    .replace(/_/g, " ")
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

export default function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const loadDocuments = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await DocumentService.getMyDocuments();

        setDocuments(response.data || []);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadDocuments();
  }, []);

  const handleDownload = async (document) => {
    try {
      setDownloadingId(document.id);
      setError("");

      const response = await DocumentService.downloadMyDocument(document.id);

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
      setDownloadingId(null);
    }
  };

  return (
    <section className="my-profile-card my-documents-card">
      <div className="my-profile-card-header my-documents-header">
        <div className="my-profile-card-icon blue">
          <FileText size={17} />
        </div>

        <div>
          <h3>My Documents</h3>
          <p>Documents associated with your employee record.</p>
        </div>
      </div>

      {error && <div className="document-error-message">{error}</div>}

      {loading ? (
        <div className="my-documents-state">Loading your documents...</div>
      ) : documents.length === 0 ? (
        <div className="my-documents-state my-documents-empty">
          <FileText size={28} />

          <h4>No documents available</h4>

          <p>
            Your HR team has not added any documents to your employee profile
            yet.
          </p>
        </div>
      ) : (
        <div className="my-documents-list">
          {documents.map((document) => {
            const status =
              STATUS_CONFIG[document.status] || STATUS_CONFIG.PENDING;

            const downloading = downloadingId === document.id;

            return (
              <div key={document.id} className="my-document-item">
                <div className="my-document-main">
                  <div className="my-document-file-icon">
                    <FileText size={18} />
                  </div>

                  <div className="my-document-info">
                    <div className="my-document-title-row">
                      <h4>{document.originalFileName}</h4>

                      <span className="document-file-type">
                        {getFileExtension(document.originalFileName)}
                      </span>
                    </div>

                    <div className="my-document-meta">
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

                <button
                  type="button"
                  className="document-icon-action"
                  title="Download document"
                  disabled={downloading}
                  onClick={() => handleDownload(document)}
                >
                  <Download size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

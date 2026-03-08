import AdminLayout from "@/Layouts/AdminLayout";
import { useState, useEffect, useRef } from "react";
import { router, usePage } from "@inertiajs/react";

interface Attachment {
  id: number;
  name: string;
  size: string;
  icon: string;
  url: string;
}

interface Reply {
  id: number;
  sender_type: "admin" | "customer";
  sender_name: string;
  sender_email: string;
  body: string;
  is_internal_note: boolean;
  created_at: string;
  date: string;
  dateFormatted: string;
  attachments: Attachment[];
}

interface Message {
  id: number;
  name: string;
  initials: string;
  email: string;
  phone: string;
  subject: string;
  excerpt: string;
  body: string;
  recipient_email: string | null;
  date: string;
  dateFormatted: string;
  read: boolean;
  starred: boolean;
  replied: boolean;
  replied_at: string | null;
  replied_by: string | null;
  replies_count: number;
  attachments: Attachment[];
  replies: Reply[];
}

interface Props {
  messages: Message[];
  isAdmin: boolean;
  companyEmail: string;
  companyName: string;
}

export default function Messages({
  messages: initialMessages,
  isAdmin,
  companyEmail,
  companyName,
}: Props) {
  const { auth } = usePage().props as unknown as {
    auth: { permissions: string[]; user: { name: string } };
  };
  const { flash } = usePage().props as {
    flash?: { success?: string; error?: string };
  };
  const canReply = auth.permissions?.includes("messages.manage") ?? false;
  const canDelete = auth.permissions?.includes("messages.delete") ?? false;

  const [selectedMessage, setSelectedMessage] = useState<Message | null>(
    initialMessages[0] || null,
  );
  const [filter, setFilter] = useState("all");
  const [replyText, setReplyText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);
  const [sending, setSending] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Message | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const conversationEndRef = useRef<HTMLDivElement>(null);

  const unreadCount = initialMessages.filter((m) => !m.read).length;
  const starredCount = initialMessages.filter((m) => m.starred).length;
  const unrepliedCount = initialMessages.filter((m) => !m.replied).length;

  const filteredMessages = initialMessages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "starred") return m.starred;
    if (filter === "unreplied") return !m.replied;
    return true;
  });

  useEffect(() => {
    if (flash?.success) {
      setNotification({ type: "success", message: flash.success });
      setTimeout(() => setNotification(null), 5000);
    }
    if (flash?.error) {
      setNotification({ type: "error", message: flash.error });
      setTimeout(() => setNotification(null), 5000);
    }
  }, [flash]);

  useEffect(() => {
    if (selectedMessage && !selectedMessage.read) {
      router.patch(
        `/admin/messages/${selectedMessage.id}/read`,
        {},
        { preserveScroll: true },
      );
    }
  }, [selectedMessage?.id]);

  useEffect(() => {
    if (selectedMessage) {
      const updated = initialMessages.find((m) => m.id === selectedMessage.id);
      if (updated) setSelectedMessage(updated);
    }
  }, [initialMessages]);

  useEffect(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedMessage?.replies]);

  const handleSelectMessage = (message: Message) => {
    setSelectedMessage(message);
    setReplyText("");
    setAttachments([]);
    setIsInternalNote(false);
  };

  const handleToggleStar = (e: React.MouseEvent, messageId: number) => {
    e.stopPropagation();
    router.patch(
      `/admin/messages/${messageId}/star`,
      {},
      { preserveScroll: true },
    );
  };

  const handleArchive = () => {
    if (!selectedMessage) return;
    router.patch(
      `/admin/messages/${selectedMessage.id}/archive`,
      {},
      {
        onSuccess: () => {
          const remaining = initialMessages.filter(
            (m) => m.id !== selectedMessage.id,
          );
          setSelectedMessage(remaining[0] || null);
        },
      },
    );
  };

  const openDeleteDialog = () => {
    if (!selectedMessage) return;
    setDeleteTarget(selectedMessage);
    setDeleteConfirmText("");
    setShowDeleteDialog(true);
  };

  const closeDeleteDialog = () => {
    setShowDeleteDialog(false);
    setDeleteTarget(null);
    setDeleteConfirmText("");
  };

  const confirmDelete = () => {
    if (!deleteTarget || deleteConfirmText !== "DELETE") return;
    router.delete(`/admin/messages/${deleteTarget.id}`, {
      onSuccess: () => {
        const remaining = initialMessages.filter(
          (m) => m.id !== deleteTarget.id,
        );
        setSelectedMessage(remaining[0] || null);
        closeDeleteDialog();
      },
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => f.size <= 10 * 1024 * 1024);
    if (validFiles.length < files.length) {
      setNotification({
        type: "error",
        message: "Some files exceed 10MB limit",
      });
    }
    setAttachments((prev) => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleReply = () => {
    if (!selectedMessage || !replyText.trim() || sending) return;
    if (replyText.trim().length < 10) {
      setNotification({
        type: "error",
        message: "Reply must be at least 10 characters",
      });
      return;
    }

    setSending(true);
    const formData = new FormData();
    formData.append("reply", replyText);
    formData.append("is_internal_note", isInternalNote ? "1" : "0");
    attachments.forEach((file, i) =>
      formData.append(`attachments[${i}]`, file),
    );

    router.post(`/admin/messages/${selectedMessage.id}/reply`, formData, {
      preserveScroll: true,
      onSuccess: () => {
        setReplyText("");
        setAttachments([]);
        setIsInternalNote(false);
        setSending(false);
      },
      onError: () => setSending(false),
    });
  };

  const getFileIcon = (file: File) => {
    const type = file.type.split("/")[0];
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (type === "image") return "fa-file-image";
    if (type === "video") return "fa-file-video";
    if (ext === "pdf") return "fa-file-pdf";
    if (["doc", "docx"].includes(ext || "")) return "fa-file-word";
    if (["xls", "xlsx"].includes(ext || "")) return "fa-file-excel";
    if (["zip", "rar"].includes(ext || "")) return "fa-file-archive";
    return "fa-file";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1048576) return (bytes / 1048576).toFixed(2) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(2) + " KB";
    return bytes + " bytes";
  };

  return (
    <AdminLayout title="Messages">
      {notification && (
        <div className={`notification-toast ${notification.type}`}>
          <i
            className={`fas ${notification.type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}`}
          ></i>
          {notification.message}
          <button onClick={() => setNotification(null)}>
            <i className="fas fa-times"></i>
          </button>
        </div>
      )}

      <div className="messages-container">
        <div className="messages-list">
          <div className="messages-list-header">
            <h3>Inbox</h3>
            <span className="unread-count">{unreadCount} unread</span>
          </div>
          <div className="messages-filter">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All ({initialMessages.length})
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread ({unreadCount})
            </button>
            <button
              className={`filter-btn ${filter === "unreplied" ? "active" : ""}`}
              onClick={() => setFilter("unreplied")}
            >
              Unreplied ({unrepliedCount})
            </button>
            <button
              className={`filter-btn ${filter === "starred" ? "active" : ""}`}
              onClick={() => setFilter("starred")}
            >
              Starred ({starredCount})
            </button>
          </div>
          <div className="messages-scroll">
            {filteredMessages.length === 0 ? (
              <div className="empty-inbox">
                <i className="fas fa-inbox"></i>
                <p>No messages found</p>
              </div>
            ) : (
              filteredMessages.map((message) => (
                <div
                  key={message.id}
                  className={`message-item ${selectedMessage?.id === message.id ? "active" : ""} ${!message.read ? "unread" : ""}`}
                  onClick={() => handleSelectMessage(message)}
                >
                  <div className="message-avatar">{message.initials}</div>
                  <div className="message-preview">
                    <h4>
                      {message.name}
                      <span>{message.date}</span>
                      {message.replies_count > 0 && (
                        <span
                          className="replies-badge"
                          title={`${message.replies_count} replies`}
                        >
                          <i className="fas fa-comments"></i>{" "}
                          {message.replies_count}
                        </span>
                      )}
                      {message.attachments.length > 0 && (
                        <span
                          className="attachment-badge"
                          title="Has attachments"
                        >
                          <i className="fas fa-paperclip"></i>
                        </span>
                      )}
                    </h4>
                    <div className="subject">{message.subject}</div>
                    <div className="excerpt">{message.excerpt}</div>
                  </div>
                  <div className="message-indicators">
                    <button
                      className={`star-btn ${message.starred ? "starred" : ""}`}
                      onClick={(e) => handleToggleStar(e, message.id)}
                    >
                      <i
                        className={`${message.starred ? "fas" : "far"} fa-star`}
                      ></i>
                    </button>
                    {!message.read && <div className="unread-dot"></div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="message-detail">
          {selectedMessage ? (
            <>
              <div className="message-detail-header">
                <div>
                  <h3>{selectedMessage.subject}</h3>
                  <p>Conversation with {selectedMessage.name}</p>
                </div>
                <div className="message-actions">
                  <button
                    className="action-btn archive"
                    title="Archive"
                    onClick={handleArchive}
                  >
                    <i className="fas fa-archive"></i>
                  </button>
                  {isAdmin && canDelete && (
                    <button
                      className="action-btn delete"
                      title="Delete"
                      onClick={openDeleteDialog}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  )}
                </div>
              </div>

              {/* Conversation Thread */}
              <div className="conversation-thread">
                {/* Original Message */}
                <div className="conversation-message customer">
                  <div className="message-bubble">
                    <div className="bubble-header">
                      <div className="sender-info">
                        <div className="sender-avatar">
                          {selectedMessage.initials}
                        </div>
                        <div>
                          <strong>{selectedMessage.name}</strong>
                          <span className="sender-email">
                            {selectedMessage.email}
                          </span>
                        </div>
                      </div>
                      <span className="message-time">
                        {selectedMessage.dateFormatted}
                      </span>
                    </div>
                    <div className="bubble-body">
                      {selectedMessage.body.split("\n").map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                    {selectedMessage.attachments.length > 0 && (
                      <div className="bubble-attachments">
                        {selectedMessage.attachments.map((att) => (
                          <a
                            key={att.id}
                            href={att.url}
                            target="_blank"
                            className="attachment-item"
                            download
                          >
                            <i className={`fas ${att.icon}`}></i>
                            <span>{att.name}</span>
                            <small>{att.size}</small>
                          </a>
                        ))}
                      </div>
                    )}
                    {selectedMessage.phone && (
                      <div className="bubble-meta">
                        <i className="fas fa-phone"></i> {selectedMessage.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Replies */}
                {selectedMessage.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`conversation-message ${reply.sender_type} ${reply.is_internal_note ? "internal-note" : ""}`}
                  >
                    <div className="message-bubble">
                      <div className="bubble-header">
                        <div className="sender-info">
                          <div
                            className={`sender-avatar ${reply.sender_type === "admin" ? "admin" : ""}`}
                          >
                            {reply.sender_type === "admin" ? (
                              <i className="fas fa-user-tie"></i>
                            ) : (
                              reply.sender_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .slice(0, 2)
                            )}
                          </div>
                          <div>
                            <strong>{reply.sender_name}</strong>
                            {reply.is_internal_note && (
                              <span className="note-badge">
                                <i className="fas fa-lock"></i> Internal Note
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="message-time">
                          {reply.dateFormatted}
                        </span>
                      </div>
                      <div className="bubble-body">
                        {reply.body.split("\n").map((p, i) => (
                          <p key={i}>{p}</p>
                        ))}
                      </div>
                      {reply.attachments.length > 0 && (
                        <div className="bubble-attachments">
                          {reply.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.url}
                              target="_blank"
                              className="attachment-item"
                              download
                            >
                              <i className={`fas ${att.icon}`}></i>
                              <span>{att.name}</span>
                              <small>{att.size}</small>
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                <div ref={conversationEndRef} />
              </div>

              {/* Reply Box */}
              {canReply && (
                <div className="reply-composer">
                  <div className="composer-header">
                    <div className="reply-type-toggle">
                      <button
                        className={`type-btn ${!isInternalNote ? "active" : ""}`}
                        onClick={() => setIsInternalNote(false)}
                      >
                        <i className="fas fa-reply"></i> Reply
                      </button>
                      <button
                        className={`type-btn ${isInternalNote ? "active" : ""}`}
                        onClick={() => setIsInternalNote(true)}
                      >
                        <i className="fas fa-lock"></i> Internal Note
                      </button>
                    </div>
                    {!isInternalNote && (
                      <span className="reply-to">
                        To: {selectedMessage.email}
                      </span>
                    )}
                  </div>

                  <textarea
                    placeholder={
                      isInternalNote
                        ? "Add an internal note (only visible to staff)..."
                        : "Type your reply..."
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={sending}
                  />

                  {attachments.length > 0 && (
                    <div className="attachment-preview">
                      {attachments.map((file, i) => (
                        <div key={i} className="preview-item">
                          <i className={`fas ${getFileIcon(file)}`}></i>
                          <span>{file.name}</span>
                          <small>{formatFileSize(file.size)}</small>
                          <button onClick={() => removeAttachment(i)}>
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="composer-footer">
                    <div className="composer-actions">
                      <input
                        type="file"
                        ref={fileInputRef}
                        multiple
                        onChange={handleFileSelect}
                        style={{ display: "none" }}
                      />
                      <button
                        className="attach-btn"
                        onClick={() => fileInputRef.current?.click()}
                        title="Attach files"
                      >
                        <i className="fas fa-paperclip"></i>
                      </button>
                      <span className="char-count">
                        {replyText.length} characters
                      </span>
                    </div>
                    <button
                      className={`send-btn ${isInternalNote ? "note" : ""}`}
                      onClick={handleReply}
                      disabled={
                        !replyText.trim() ||
                        replyText.trim().length < 10 ||
                        sending
                      }
                    >
                      {sending ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i> Sending...
                        </>
                      ) : isInternalNote ? (
                        <>
                          <i className="fas fa-sticky-note"></i> Add Note
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i> Send Reply
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="no-message-selected">
              <i className="fas fa-envelope-open"></i>
              <p>Select a message to read</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      {showDeleteDialog && deleteTarget && (
        <div className="modal-overlay active">
          <div className="modal modal-delete">
            <div className="modal-header">
              <h3>Delete Message</h3>
              <button className="modal-close" onClick={closeDeleteDialog}>
                &times;
              </button>
            </div>
            <div className="modal-body">
              <p className="delete-warning">
                This will permanently delete this conversation and all replies.
              </p>
              <p className="delete-confirm-label">
                Type <strong>DELETE</strong> to confirm.
              </p>
              <input
                type="text"
                className="delete-confirm-input"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-danger btn-block"
                disabled={deleteConfirmText !== "DELETE"}
                onClick={confirmDelete}
              >
                Delete Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
                .notification-toast {
                    position: fixed; top: 80px; right: 20px; padding: 15px 20px; border-radius: 8px;
                    display: flex; align-items: center; gap: 10px; z-index: 1000;
                    animation: slideIn 0.3s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .notification-toast.success { background: #e3f2fd; color: #2e7d32; border: 1px solid #a5d6a7; }
                .notification-toast.error { background: #ffebee; color: #c62828; border: 1px solid #ef9a9a; }
                .notification-toast button { background: none; border: none; cursor: pointer; opacity: 0.7; margin-left: 10px; }
                @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

                .replies-badge, .attachment-badge {
                    display: inline-flex; align-items: center; gap: 4px; padding: 2px 6px;
                    background: #e3f2fd; color: #1976d2; border-radius: 10px; font-size: 11px; margin-left: 6px;
                }
                .attachment-badge { background: #fff3e0; color: #e65100; }

                .empty-inbox { padding: 40px 20px; text-align: center; color: #999; }
                .empty-inbox i { font-size: 48px; margin-bottom: 15px; display: block; }

                .conversation-thread {
                    flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px;
                    background: linear-gradient(180deg, #f8f9fa 0%, #fff 100%);
                }

                .conversation-message { display: flex; }
                .conversation-message.customer { justify-content: flex-start; }
                .conversation-message.admin { justify-content: flex-end; }

                .message-bubble {
                    max-width: 75%; padding: 16px; border-radius: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.08);
                }
                .customer .message-bubble { background: #fff; border-bottom-left-radius: 4px; }
                .admin .message-bubble { background: #e3f2fd; border-bottom-right-radius: 4px; }
                .internal-note .message-bubble { background: #fff8e1; border: 2px dashed #ffc107; }

                .bubble-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; gap: 12px; }
                .sender-info { display: flex; align-items: center; gap: 10px; }
                .sender-avatar {
                    width: 36px; height: 36px; border-radius: 50%; background: #4671b0; color: #fff;
                    display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600;
                }
                .sender-avatar.admin { background: #1976d2; }
                .sender-info strong { display: block; font-size: 14px; }
                .sender-email { font-size: 12px; color: #666; }
                .message-time { font-size: 11px; color: #999; white-space: nowrap; }
                .note-badge { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; background: #ffc107; color: #333; border-radius: 10px; font-size: 10px; margin-left: 8px; }

                .bubble-body { font-size: 14px; line-height: 1.6; color: #333; }
                .bubble-body p { margin: 0 0 8px; }
                .bubble-body p:last-child { margin-bottom: 0; }
                .bubble-meta { margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); font-size: 12px; color: #666; }
                .bubble-meta i { margin-right: 6px; }

                .bubble-attachments { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(0,0,0,0.1); }
                .attachment-item {
                    display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: rgba(0,0,0,0.05);
                    border-radius: 8px; text-decoration: none; color: #333; font-size: 13px; transition: background 0.2s;
                }
                .attachment-item:hover { background: rgba(0,0,0,0.1); }
                .attachment-item i { color: #666; }
                .attachment-item small { color: #999; margin-left: auto; }
            `}</style>

      <style>{`
                .reply-composer {
                    border-top: 1px solid #eee; padding: 16px; background: #fafafa;
                }
                .composer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
                .reply-type-toggle { display: flex; gap: 8px; }
                .type-btn {
                    padding: 8px 16px; border: 2px solid #e0e0e0; border-radius: 20px; background: #fff;
                    cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 6px; transition: all 0.2s;
                }
                .type-btn.active { border-color: #4671b0; background: #e3f2fd; color: #4671b0; }
                .type-btn:hover:not(.active) { border-color: #bbb; }
                .reply-to { font-size: 13px; color: #666; }

                .reply-composer textarea {
                    width: 100%; min-height: 100px; padding: 12px; border: 2px solid #e0e0e0; border-radius: 12px;
                    font-family: inherit; font-size: 14px; resize: vertical; transition: border-color 0.2s;
                }
                .reply-composer textarea:focus { outline: none; border-color: #4671b0; }
                .reply-composer textarea:disabled { background: #f5f5f5; }

                .attachment-preview { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
                .preview-item {
                    display: flex; align-items: center; gap: 8px; padding: 8px 12px; background: #e3f2fd;
                    border-radius: 8px; font-size: 13px;
                }
                .preview-item i { color: #1976d2; }
                .preview-item small { color: #666; }
                .preview-item button { background: none; border: none; cursor: pointer; color: #999; padding: 2px; }
                .preview-item button:hover { color: #d32f2f; }

                .composer-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; }
                .composer-actions { display: flex; align-items: center; gap: 12px; }
                .attach-btn {
                    width: 36px; height: 36px; border: none; border-radius: 50%; background: #f0f0f0;
                    cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background 0.2s;
                }
                .attach-btn:hover { background: #e0e0e0; }
                .char-count { font-size: 12px; color: #999; }

                .send-btn {
                    padding: 12px 24px; border: none; border-radius: 24px; background: #4671b0; color: #fff;
                    font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s;
                }
                .send-btn:hover:not(:disabled) { background: #2b4c7e; }
                .send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
                .send-btn.note { background: #ffc107; color: #333; }
                .send-btn.note:hover:not(:disabled) { background: #ffb300; }

                .no-message-selected {
                    display: flex; flex-direction: column; align-items: center; justify-content: center;
                    height: 100%; color: #999;
                }
                .no-message-selected i { font-size: 64px; margin-bottom: 20px; }

                .dark-mode .conversation-thread { background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%); }
                .dark-mode .message-bubble { box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
                .dark-mode .customer .message-bubble { background: #1e3a5f; }
                .dark-mode .admin .message-bubble { background: #1a2d4a; }
                .dark-mode .internal-note .message-bubble { background: #3d3d00; border-color: #ffc107; }
                .dark-mode .bubble-body { color: #e0e0e0; }
                .dark-mode .reply-composer { background: #1a1a2e; border-color: #2a3f5f; }
                .dark-mode .reply-composer textarea { background: #16213e; border-color: #2a3f5f; color: #e0e0e0; }
                .dark-mode .type-btn { background: #16213e; border-color: #2a3f5f; color: #e0e0e0; }
                .dark-mode .type-btn.active { background: #1a2d4a; border-color: #4671b0; }
            `}</style>
    </AdminLayout>
  );
}

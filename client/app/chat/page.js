"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { API_BASE_URL, getApiErrorMessage } from "../../lib/api";
import { getAuthSession } from "../../lib/auth";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const [authSession, setAuthSession] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [activeEmail, setActiveEmail] = useState("");
  const [activeConversation, setActiveConversation] = useState(null);
  const [messageDraft, setMessageDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversationLoading, setConversationLoading] = useState(false);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);

  const currentUserEmail = authSession?.user?.email || "";

  const contactMap = useMemo(
    () =>
      new Map(
        contacts.map((contact) => [
          contact.email,
          contact
        ])
      ),
    [contacts]
  );

  const conversationMap = useMemo(
    () =>
      new Map(
        conversations.map((conversation) => [
          conversation.email,
          conversation
        ])
      ),
    [conversations]
  );

  useEffect(() => {
    const session = getAuthSession();
    setAuthSession(session);

    async function loadChatData() {
      if (!session?.token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [contactsRes, conversationsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/api/messages/contacts`, {
            headers: {
              Authorization: `Bearer ${session.token}`
            }
          }),
          fetch(`${API_BASE_URL}/api/messages/conversations`, {
            headers: {
              Authorization: `Bearer ${session.token}`
            }
          })
        ]);

        const [contactsData, conversationsData] = await Promise.all([
          contactsRes.json(),
          conversationsRes.json()
        ]);

        if (!contactsRes.ok) {
          throw new Error(contactsData.message || "Could not load student contacts");
        }

        if (!conversationsRes.ok) {
          throw new Error(conversationsData.message || "Could not load conversations");
        }

        setContacts(contactsData);
        setConversations(conversationsData);

        const preferredEmail = searchParams.get("email");
        const defaultEmail =
          preferredEmail ||
          conversationsData[0]?.email ||
          contactsData[0]?.email ||
          "";

        setActiveEmail(defaultEmail);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load messaging"));
      } finally {
        setLoading(false);
      }
    }

    loadChatData();
  }, [searchParams]);

  useEffect(() => {
    async function loadConversation() {
      if (!authSession?.token || !activeEmail) {
        setActiveConversation(null);
        return;
      }

      try {
        setConversationLoading(true);
        setError("");
        setActiveConversation(null);

        const res = await fetch(
          `${API_BASE_URL}/api/messages/conversation/${encodeURIComponent(activeEmail)}`,
          {
            headers: {
              Authorization: `Bearer ${authSession.token}`
            }
          }
        );

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Could not load conversation");
        }

        setActiveConversation(data);
      } catch (err) {
        setError(getApiErrorMessage(err, "Could not load conversation"));
      } finally {
        setConversationLoading(false);
      }
    }

    loadConversation();
  }, [activeEmail, authSession]);

  async function submitMessage() {
    if (!messageDraft.trim() || !activeEmail || !authSession?.token) {
      return;
    }

    try {
      setSending(true);
      setSendError("");

      const res = await fetch(`${API_BASE_URL}/api/messages/send`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authSession.token}`
        },
        body: JSON.stringify({
          recipientEmail: activeEmail,
          text: messageDraft
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Could not send message");
      }

      setActiveConversation((currentConversation) => ({
        participant: currentConversation?.participant || data.participant,
        messages: [...(currentConversation?.messages || []), data.message]
      }));

      setConversations((currentConversations) => {
        const remainingConversations = currentConversations.filter(
          (conversation) => conversation.email !== activeEmail
        );

        return [
          {
            email: activeEmail,
            name: data.participant?.name || activeEmail,
            lastMessage: data.message.text,
            lastMessageAt: data.message.createdAt
          },
          ...remainingConversations
        ];
      });

      setMessageDraft("");
    } catch (err) {
      setSendError(getApiErrorMessage(err, "Could not send message"));
    } finally {
      setSending(false);
    }
  }

  async function handleSendMessage(e) {
    e.preventDefault();
    await submitMessage();
  }

  if (!authSession?.token && !loading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Messaging
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Sign in to chat with students</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          NeighborNet messaging is available only for logged-in Lakehead students.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-slate-500">Loading messages...</p>
      </div>
    );
  }

  const activeParticipant =
    activeConversation?.participant ||
    contactMap.get(activeEmail) ||
    conversationMap.get(activeEmail) ||
    null;

  return (
    <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
      <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
          Messaging
        </p>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">Student inbox</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Chat with other Lakehead students about listings, landlords, and neighborhoods.
        </p>

        <div className="mt-6 rounded-2xl bg-gradient-to-br from-slate-50 to-emerald-50 p-4">
          <p className="text-sm text-slate-500">Logged in as</p>
          <p className="mt-1 font-semibold text-slate-900">{currentUserEmail}</p>
        </div>

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Active Conversations
          </p>

          <div className="mt-3 space-y-3">
            {conversations.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No messages yet. Start by selecting a student below.
              </div>
            ) : (
              conversations.map((conversation) => (
                <button
                  key={conversation.email}
                  type="button"
                  onClick={() => setActiveEmail(conversation.email)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    conversation.email === activeEmail
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{conversation.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{conversation.email}</p>
                  <p className="mt-3 truncate text-sm text-slate-600">
                    {conversation.lastMessage || "Open conversation"}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Student Directory
          </p>

          <div className="mt-3 space-y-3">
            {contacts.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
                No other students have signed up yet.
              </div>
            ) : (
              contacts.map((contact) => (
                <button
                  key={contact.email}
                  type="button"
                  onClick={() => setActiveEmail(contact.email)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${
                    contact.email === activeEmail
                      ? "border-emerald-200 bg-emerald-50"
                      : "border-slate-200 bg-white hover:bg-slate-50"
                  }`}
                >
                  <p className="font-semibold text-slate-900">{contact.name}</p>
                  <p className="mt-1 text-sm text-slate-500">{contact.email}</p>
                </button>
              ))
            )}
          </div>
        </div>
      </aside>

      <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)]">
        <div className="border-b border-slate-200 bg-gradient-to-r from-white via-emerald-50 to-cyan-50 px-6 py-5">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
            Active Chat
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">
            {activeParticipant?.name || "Choose a student"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {activeParticipant?.email || "Select a conversation or student contact to begin"}
          </p>
        </div>

        <div className="space-y-4 bg-[linear-gradient(180deg,#ffffff_0%,#f8fbfc_100%)] px-6 py-6">
          {error ? (
            <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {conversationLoading ? (
            <p className="text-slate-500">Loading conversation...</p>
          ) : !activeEmail ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
              Pick a student from the directory to start chatting.
            </div>
          ) : activeConversation?.messages?.length ? (
            activeConversation.messages.map((message) => {
              const isCurrentUser = message.sender === currentUserEmail;

              return (
                <div
                  key={message._id}
                  className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-xl rounded-3xl px-5 py-4 shadow-sm ${
                      isCurrentUser
                        ? "bg-teal-500 text-white"
                        : "border border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <p className="leading-7">{message.text}</p>
                    <p
                      className={`mt-3 text-xs ${
                        isCurrentUser ? "text-white/80" : "text-slate-500"
                      }`}
                    >
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit"
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-slate-500">
              No messages in this conversation yet. Say hello and start the discussion.
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="border-t border-slate-200 px-6 py-5">
          {sendError ? (
            <p className="mb-3 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {sendError}
            </p>
          ) : null}

          <div className="flex gap-3">
            <input
              value={messageDraft}
              onChange={(e) => setMessageDraft(e.target.value)}
              placeholder={activeEmail ? "Write a message..." : "Choose a student first"}
              disabled={!activeEmail}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-emerald-400"
            />

            <button
              type="submit"
              disabled={sending || !activeEmail}
              className="rounded-2xl bg-teal-500 px-5 py-3 font-semibold text-white transition hover:bg-teal-600 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

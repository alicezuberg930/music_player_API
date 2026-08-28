import type { ApiResponse } from "@/@types";
import { httpClient } from "@/lib/repository/http-client";
import { useAuthContext } from "@/providers/auth-provider";
import {
  type ChatNotificationPayload,
  useSocketContext,
} from "@/providers/socket-provider";
import { CheckCheck, MessageCircle, Send, toast } from "@yukikaze/ui";
import { Avatar, AvatarFallback, AvatarImage } from "@yukikaze/ui/avatar";
import { Bubble, BubbleContent, BubbleGroup } from "@yukikaze/ui/bubble";
import { Button } from "@yukikaze/ui/button";
import { Input } from "@yukikaze/ui/input";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageHeader,
} from "@yukikaze/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  useMessageScroller,
} from "@yukikaze/ui/message-scroller";
import { Popover, PopoverContent, PopoverTrigger } from "@yukikaze/ui/popover";
import type { SendChatInput } from "@yukikaze/validator";
import { useEffect, useRef, useState, type KeyboardEvent } from "react";

type ChatMessage = {
  id: string;
  sender: "me" | "them";
  text: string;
  time: string;
};

type ChatRecipient = {
  id: string;
  name: string;
  avatar?: string;
};

type Conversation = {
  recipient: ChatRecipient;
  messages: ChatMessage[];
};

type ChatPanelProps = {
  recipient: ChatRecipient | null;
  messages: ChatMessage[];
  isSending: boolean;
  onSend: (content: string) => Promise<boolean>;
};

const messageTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
});

const formatMessageTime = (timestamp: string | Date) =>
  messageTimeFormatter.format(new Date(timestamp));

const ChatPanel = ({
  recipient,
  messages,
  isSending,
  onSend,
}: ChatPanelProps) => {
  const { scrollToEnd } = useMessageScroller();
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const frame = window.requestAnimationFrame(() =>
      scrollToEnd({ behavior: "smooth" }),
    );
    return () => window.cancelAnimationFrame(frame);
  }, [messages.length, recipient?.id, scrollToEnd]);

  const send = async () => {
    const content = draft.trim();
    if (!content || !recipient || isSending) return;
    if (await onSend(content)) setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void send();
  };

  const grouped = messages.reduce<
    Array<{ sender: ChatMessage["sender"]; items: ChatMessage[] }>
  >((groups, message) => {
    const last = groups.at(-1);
    if (last?.sender === message.sender) last.items.push(message);
    else groups.push({ sender: message.sender, items: [message] });
    return groups;
  }, []);

  const recipientInitial = recipient?.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      <div className="flex items-center gap-3 border-b p-2">
        <Avatar className="h-10 w-10">
          {recipient?.avatar ? (
            <AvatarImage src={recipient.avatar} alt={recipient.name} />
          ) : null}
          <AvatarFallback>{recipientInitial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold tracking-tight text-stone-900">
            {recipient?.name ?? "Messages"}
          </span>
          <span className="text-xs text-stone-500">
            {recipient ? "Connected" : "New messages will appear here"}
          </span>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <MessageScroller>
          <MessageScrollerViewport className="px-4 py-4">
            <MessageScrollerContent className="gap-3">
              {messages.length === 0 ? (
                <MessageScrollerItem>
                  <div className="py-8 text-center text-sm text-stone-500">
                    No messages yet
                  </div>
                </MessageScrollerItem>
              ) : (
                <MessageScrollerItem>
                  <div className="flex items-center justify-center gap-3 py-1">
                    <span className="h-px w-10 border-t border-dashed border-stone-300" />
                    <span className="text-xs text-stone-400">Today</span>
                    <span className="h-px w-10 border-t border-dashed border-stone-300" />
                  </div>
                </MessageScrollerItem>
              )}

              {grouped.map((group) => {
                const isMe = group.sender === "me";
                const firstMessage = group.items[0];
                if (!firstMessage) return null;

                return (
                  <MessageScrollerItem
                    key={firstMessage.id}
                    messageId={firstMessage.id}
                    scrollAnchor
                  >
                    <Message align={isMe ? "end" : "start"}>
                      <MessageAvatar>
                        <Avatar>
                          {!isMe && recipient?.avatar ? (
                            <AvatarImage
                              src={recipient.avatar}
                              alt={recipient.name}
                            />
                          ) : null}
                          <AvatarFallback>
                            {isMe ? "You" : recipientInitial}
                          </AvatarFallback>
                        </Avatar>
                      </MessageAvatar>
                      <MessageContent>
                        {!isMe ? (
                          <MessageHeader>
                            {`${recipient?.name ?? "Unknown"} · ${firstMessage.time}`}
                          </MessageHeader>
                        ) : null}
                        <BubbleGroup>
                          {group.items.map((message) => (
                            <Bubble key={message.id}>
                              <BubbleContent>{message.text}</BubbleContent>
                            </Bubble>
                          ))}
                        </BubbleGroup>
                        {isMe ? (
                          <MessageFooter>
                            {group.items.at(-1)?.time}
                            <CheckCheck className="h-3.5 w-3.5 text-emerald-700" />
                          </MessageFooter>
                        ) : null}
                      </MessageContent>
                    </Message>
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>

          <MessageScrollerButton className="bottom-3 start-auto end-3 translate-x-0 rounded-full border-stone-200 bg-stone-50 shadow-md hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-emerald-800 focus-visible:ring-offset-2 rtl:translate-x-0" />
        </MessageScroller>
      </div>

      <div className="flex items-center gap-2 border-t p-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            recipient ? `Message ${recipient.name}...` : "Waiting for a message..."
          }
          aria-label="Message"
          disabled={!recipient || isSending}
          autoFocus
        />
        <Button
          onClick={() => void send()}
          disabled={!recipient || !draft.trim() || isSending}
          aria-label="Send message"
          className="h-full"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
};

export const ChatBubble = () => {
  const { socket } = useSocketContext();
  const { user } = useAuthContext();
  const [conversations, setConversations] = useState<
    Record<string, Conversation>
  >({});
  const [activeRecipientId, setActiveRecipientId] = useState<string | null>(
    null,
  );
  const [isSending, setIsSending] = useState(false);
  const sendingRef = useRef(false);

  useEffect(() => {
    if (!socket || !user?.id) return;

    const handleNewMessage = (payload: ChatNotificationPayload) => {
      if (payload.toUserId !== user.id) return;

      const recipient: ChatRecipient = {
        id: payload.actorUserId,
        name: payload.actorFullName,
        avatar: payload.actorAvatar || undefined,
      };
      const message: ChatMessage = {
        id: payload.refId,
        sender: "them",
        text: payload.content,
        time: formatMessageTime(payload.emittedAt),
      };

      setConversations((current) => {
        const conversation = current[recipient.id];
        if (conversation?.messages.some(({ id }) => id === message.id)) {
          return current;
        }

        return {
          ...current,
          [recipient.id]: {
            recipient,
            messages: [...(conversation?.messages ?? []), message],
          },
        };
      });
      setActiveRecipientId(recipient.id);
    };

    socket.on("notification:chat", handleNewMessage);
    return () => {
      socket.off("notification:chat", handleNewMessage);
    };
  }, [socket, user?.id]);

  const sendMessage = async (content: string) => {
    const recipientId = activeRecipientId;
    if (!recipientId || sendingRef.current) return false;

    sendingRef.current = true;
    setIsSending(true);

    try {
      const input: SendChatInput = { toUserId: recipientId, content };
      const response = await httpClient.post<ApiResponse<{ id: string }>>(
        "/social/chats",
        input,
      );
      if (!response.data?.id) throw new Error("Message response is missing its id");

      const message: ChatMessage = {
        id: response.data.id,
        sender: "me",
        text: content,
        time: formatMessageTime(new Date()),
      };

      setConversations((current) => {
        const conversation = current[recipientId];
        if (!conversation) return current;

        return {
          ...current,
          [recipientId]: {
            ...conversation,
            messages: [...conversation.messages, message],
          },
        };
      });
      return true;
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to send message",
      );
      return false;
    } finally {
      sendingRef.current = false;
      setIsSending(false);
    }
  };

  const conversation = activeRecipientId
    ? conversations[activeRecipientId]
    : undefined;

  return (
    <Popover>
      <PopoverTrigger className="absolute bottom-3 right-3">
        <Button size="icon-lg">
          <MessageCircle />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        className="h-[min(600px,85vh)] w-full max-w-lg overflow-hidden p-0 shadow-xl"
      >
        <MessageScrollerProvider autoScroll defaultScrollPosition="end">
          <ChatPanel
            recipient={conversation?.recipient ?? null}
            messages={conversation?.messages ?? []}
            isSending={isSending}
            onSend={sendMessage}
          />
        </MessageScrollerProvider>
      </PopoverContent>
    </Popover>
  );
};

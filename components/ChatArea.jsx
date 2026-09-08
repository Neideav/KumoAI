import React, { useRef, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SuggestionChips from './SuggestionChips';

export default function ChatArea({
  messages = [],
  isLoading,
  streamingContent,
  streamingThinking,
  streamingSources,
  onSelectSuggestion,
  onRegenerate
}) {
  const scrollRef = useRef(null);
  const bottomAnchorRef = useRef(null);

  // Auto scroll to bottom when messages update
  useEffect(() => {
    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({ behavior: isLoading ? 'auto' : 'smooth' });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, streamingThinking, isLoading]);

  // Filter out any invalid / empty placeholder messages
  const validMessages = messages.filter(
    (msg) =>
      (msg.content && msg.content.trim().length > 0) ||
      (msg.sources && msg.sources.length > 0) ||
      (msg.thinking && msg.thinking.trim().length > 0)
  );

  const hasMessages = validMessages.length > 0;

  return (
    <div className="messages-scroll-area" ref={scrollRef}>
      <div className="messages-content-wrapper">
        {!hasMessages ? (
          <div className="empty-state-hero">
            <div className="hero-brand-display">
              <span className="hero-brand-name">Kumo</span>
              <span className="hero-brand-dot">.</span>
            </div>

            <div className="empty-state-badge">
              <Sparkles size={15} className="text-accent sparkle-anim" />
              <span>Kumo AI Intelligence</span>
            </div>

            <h1 className="empty-state-title">
              Halo! Apa yang ingin kita eksplorasi hari ini?
            </h1>

            <p className="empty-state-subtitle">
              Mulai percakapan baru, analisis konsep rumit, hasilkan ide kreatif, atau pilih salah satu inspirasi di bawah:
            </p>

            <SuggestionChips onSelectSuggestion={onSelectSuggestion} />
          </div>
        ) : (
          <>
            {validMessages.map((msg, index) => (
              <MessageBubble
                key={index}
                message={msg}
                onRegenerate={
                  index === validMessages.length - 1 && msg.role === 'assistant'
                    ? onRegenerate
                    : undefined
                }
                isStreaming={false}
              />
            ))}

            {/* Live Streaming Message Bubble only when active conversation is streaming */}
            {isLoading && (
              <MessageBubble
                message={{
                  role: 'assistant',
                  content: streamingContent,
                  thinking: streamingThinking,
                  sources: streamingSources
                }}
                isStreaming={true}
              />
            )}

            {/* Bottom spacer ensures the last message and toolbar are never covered by input card */}
            <div ref={bottomAnchorRef} className="scroll-bottom-spacer" />
          </>
        )}
      </div>
    </div>
  );
}

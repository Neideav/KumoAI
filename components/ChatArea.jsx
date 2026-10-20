import React, { useRef, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';
import MessageBubble from './MessageBubble';
import SuggestionChips from './SuggestionChips';
import { heroContainerVariants, heroItemVariants } from '../utils/motion';

export default function ChatArea({
  messages = [],
  isLoading,
  requestStatus = 'idle',
  requestStartTime,
  requestEndTime,
  streamingContent,
  streamingThinking,
  streamingSources,
  onSelectSuggestion,
  onRegenerate
}) {
  const scrollRef = useRef(null);
  const bottomAnchorRef = useRef(null);
  const isUserNearBottomRef = useRef(true);

  // Monitor user scroll position: if user scrolled up to read earlier messages, do not force them to the bottom
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isUserNearBottomRef.current = distanceToBottom < 100;
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // When a new message is appended or generation starts, scroll if following
  useEffect(() => {
    if (!isUserNearBottomRef.current) return;

    if (bottomAnchorRef.current) {
      bottomAnchorRef.current.scrollIntoView({ behavior: isLoading ? 'auto' : 'smooth' });
    } else if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length, streamingContent, streamingThinking, isLoading]);

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
          <motion.div
            className="empty-state-hero"
            variants={heroContainerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="hero-brand-display" variants={heroItemVariants}>
              <span className="hero-brand-name">Kumo</span>
              <span className="hero-brand-dot">.</span>
            </motion.div>

            <motion.div className="empty-state-badge" variants={heroItemVariants}>
              <Sparkles size={15} className="text-accent sparkle-anim" />
              <span>Kumo AI Intelligence</span>
            </motion.div>

            <motion.h1 className="empty-state-title" variants={heroItemVariants}>
              Halo! Apa yang ingin kita eksplorasi hari ini?
            </motion.h1>

            <motion.p className="empty-state-subtitle" variants={heroItemVariants}>
              Mulai percakapan baru, analisis konsep rumit, hasilkan ide kreatif, atau pilih salah satu inspirasi di bawah:
            </motion.p>

            <motion.div variants={heroItemVariants} style={{ width: '100%' }}>
              <SuggestionChips onSelectSuggestion={onSelectSuggestion} />
            </motion.div>
          </motion.div>
        ) : (
          <>
            {validMessages.map((msg, index) => {
              const stableKey = msg.id || `msg_${index}_${msg.timestamp || ''}`;
              return (
                <MessageBubble
                  key={stableKey}
                  message={msg}
                  onRegenerate={
                    index === validMessages.length - 1 && msg.role === 'assistant'
                      ? onRegenerate
                      : undefined
                  }
                  isStreaming={false}
                />
              );
            })}

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
                requestStatus={requestStatus}
                requestStartTime={requestStartTime}
                requestEndTime={requestEndTime}
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


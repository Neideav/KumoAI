import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  RefreshCw,
  Globe,
  ExternalLink
} from 'lucide-react';
import { renderMarkdown } from '../utils/markdownRenderer';
import ThoughtLine from './ThoughtLine';

export default function MessageBubble({
  message,
  onRegenerate,
  isStreaming = false,
  requestStatus = 'idle',
  requestStartTime,
  requestEndTime
}) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }

      window.speechSynthesis.cancel();
      const cleanContent = (message.content || '').replace(/```[\s\S]*?```/g, 'Code block omitted.');
      const utterance = new SpeechSynthesisUtterance(cleanContent);
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find(v => v.lang.includes('id') || v.lang.includes('ID'));
      if (idVoice) utterance.voice = idVoice;

      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  if (isUser) {
    return (
      <motion.div
        className="message-item user"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        {message.attachment && (
          <div className="user-attachment-preview">
            <img src={message.attachment.data} alt={message.attachment.name || 'Uploaded preview'} />
          </div>
        )}
        <div className="user-bubble">
          {message.content}
        </div>
      </motion.div>
    );
  }

  // Assistant status determination
  const shouldShowThoughtLine = isStreaming || Boolean(message.thinking) || Boolean(message.startTime);
  const assistantStatus = isStreaming
    ? (requestStatus !== 'idle' ? requestStatus : (message.content ? 'streaming' : 'waiting'))
    : (message.status || (message.isError ? 'error' : 'completed'));

  return (
    <motion.div
      className="message-item assistant"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* React Bits Thought Line for AI Status & Thinking Process */}
      {shouldShowThoughtLine && (
        <ThoughtLine
          status={assistantStatus}
          startTime={isStreaming ? requestStartTime : message.startTime}
          endTime={isStreaming ? requestEndTime : message.endTime}
          thinkingContent={message.thinking}
          collapsible={Boolean(message.thinking)}
          showTimer={true}
        />
      )}

      {/* Deep Search Sources */}
      {message.sources && message.sources.length > 0 && (
        <div className="search-sources-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
            <Globe size={13} color="#2563eb" />
            <span>Search Sources:</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {message.sources.map((src, idx) => (
              <a
                key={idx}
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="search-source-pill"
              >
                <span>{src.title}</span>
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Assistant Main Text (Markdown) */}
      {(message.content || (isStreaming && message.content)) ? (
        <div className="assistant-bubble">
          {message.content ? (
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
            />
          ) : null}
          {isStreaming && <span className="streaming-cursor" />}
        </div>
      ) : null}

      {/* Message Action Toolbar */}
      {!isStreaming && message.content && (
        <div className="message-actions-toolbar" role="toolbar" aria-label="Aksi pesan">
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            className="msg-action-btn"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Salin pesan"}
            aria-label="Salin pesan"
          >
            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            className={`msg-action-btn ${liked ? 'active-like' : ''}`}
            onClick={() => {
              setLiked(!liked);
              if (disliked) setDisliked(false);
            }}
            title="Good response"
            aria-label="Respons bagus"
          >
            <ThumbsUp size={14} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            className={`msg-action-btn ${disliked ? 'active-dislike' : ''}`}
            onClick={() => {
              setDisliked(!disliked);
              if (liked) setLiked(false);
            }}
            title="Bad response"
            aria-label="Respons kurang tepat"
          >
            <ThumbsDown size={14} />
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.92 }}
            type="button"
            className="msg-action-btn"
            onClick={handleSpeak}
            title={speaking ? "Stop speaking" : "Bacakan pesan"}
            aria-label={speaking ? "Hentikan pembacaan" : "Bacakan pesan"}
          >
            <Volume2 size={14} color={speaking ? '#2563eb' : 'currentColor'} />
          </motion.button>

          {onRegenerate && (
            <motion.button
              whileTap={{ scale: 0.92 }}
              type="button"
              className="msg-action-btn"
              onClick={onRegenerate}
              title="Regenerate response"
              aria-label="Buat ulang jawaban"
            >
              <RefreshCw size={14} />
            </motion.button>
          )}
        </div>
      )}
    </motion.div>
  );
}


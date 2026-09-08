import React, { useState } from 'react';
import {
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Volume2,
  RefreshCw,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  Globe,
  ExternalLink
} from 'lucide-react';
import { renderMarkdown } from '../utils/markdownRenderer';

export default function MessageBubble({
  message,
  onRegenerate,
  isStreaming
}) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(true);

  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
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
      const utterance = new SpeechSynthesisUtterance(message.content.replace(/```[\s\S]*?```/g, 'Code block omitted.'));
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
      <div className="message-item user">
        {message.attachment && (
          <div className="user-attachment-preview">
            <img src={message.attachment.data} alt={message.attachment.name || 'Uploaded preview'} />
          </div>
        )}
        <div className="user-bubble">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="message-item assistant">
      {/* Reasoning / Thinking Process Accordion */}
      {message.thinking && (
        <div className="reasoning-box">
          <div
            className="reasoning-header"
            onClick={() => setReasoningOpen(!reasoningOpen)}
          >
            <div className="reasoning-title-left">
              <Lightbulb size={15} color="#7c3aed" />
              <span>Thinking Process</span>
            </div>
            {reasoningOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </div>
          {reasoningOpen && (
            <div className="reasoning-content">
              {message.thinking}
            </div>
          )}
        </div>
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
                rel="noreferrer"
                className="search-source-pill"
              >
                <span>{src.title}</span>
                <ExternalLink size={10} />
              </a>
            ))}
          </div>
        </div>
      )}

      {/* 3-Dots Minimal Loading Indicator */}
      {isStreaming && !message.content && !message.thinking && (
        <div className="loading-dots-container">
          <span className="loading-dot" />
          <span className="loading-dot" />
          <span className="loading-dot" />
        </div>
      )}

      {/* Assistant Main Text (Markdown) */}
      {(message.content || (isStreaming && message.content)) && (
        <div className="assistant-bubble">
          {message.content ? (
            <div
              className="markdown-body"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
            />
          ) : null}
          {isStreaming && <span className="streaming-cursor" />}
        </div>
      )}

      {/* Message Action Toolbar */}
      {!isStreaming && message.content && (
        <div className="message-actions-toolbar">
          <button
            className="msg-action-btn"
            onClick={handleCopy}
            title={copied ? "Copied!" : "Copy message"}
          >
            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
          </button>

          <button
            className={`msg-action-btn ${liked ? 'active-like' : ''}`}
            onClick={() => {
              setLiked(!liked);
              if (disliked) setDisliked(false);
            }}
            title="Good response"
          >
            <ThumbsUp size={14} />
          </button>

          <button
            className={`msg-action-btn ${disliked ? 'active-dislike' : ''}`}
            onClick={() => {
              setDisliked(!disliked);
              if (liked) setLiked(false);
            }}
            title="Bad response"
          >
            <ThumbsDown size={14} />
          </button>

          <button
            className="msg-action-btn"
            onClick={handleSpeak}
            title={speaking ? "Stop speaking" : "Read aloud"}
          >
            <Volume2 size={14} color={speaking ? '#2563eb' : 'currentColor'} />
          </button>

          {onRegenerate && (
            <button
              className="msg-action-btn"
              onClick={onRegenerate}
              title="Regenerate response"
            >
              <RefreshCw size={14} />
            </button>
          )}
        </div>
      )}
    </div>
  );
}

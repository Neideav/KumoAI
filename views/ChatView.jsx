import React from 'react';
import ChatArea from '../components/ChatArea';
import ChatInput from '../components/ChatInput';

export default function ChatView({
  messages,
  isLoading,
  streamingContent,
  streamingThinking,
  streamingSources,
  onSelectSuggestion,
  onRegenerate,
  input,
  setInput,
  onSend,
  onStop,
  attachment,
  setAttachment,
  isDeepSearch,
  setIsDeepSearch,
  isReasoning,
  setIsReasoning,
  currentModel,
  onModelChange,
  enterToSend
}) {
  return (
    <div className="chat-view-container">
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        streamingContent={streamingContent}
        streamingThinking={streamingThinking}
        streamingSources={streamingSources}
        onSelectSuggestion={onSelectSuggestion}
        onRegenerate={onRegenerate}
      />
      <ChatInput
        input={input}
        setInput={setInput}
        onSend={onSend}
        onStop={onStop}
        isLoading={isLoading}
        attachment={attachment}
        setAttachment={setAttachment}
        isDeepSearch={isDeepSearch}
        setIsDeepSearch={setIsDeepSearch}
        isReasoning={isReasoning}
        setIsReasoning={setIsReasoning}
        currentModel={currentModel}
        onModelChange={onModelChange}
        enterToSend={enterToSend}
      />
    </div>
  );
}

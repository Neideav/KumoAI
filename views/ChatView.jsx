import React from 'react';
import { motion } from 'motion/react';
import ChatArea from '../components/ChatArea';
import ChatInput from '../components/ChatInput';
import { routeViewVariants } from '../utils/motion';

export default function ChatView({
  messages,
  isLoading,
  requestStatus,
  requestStartTime,
  requestEndTime,
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
    <motion.div
      className="chat-view-container"
      variants={routeViewVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <ChatArea
        messages={messages}
        isLoading={isLoading}
        requestStatus={requestStatus}
        requestStartTime={requestStartTime}
        requestEndTime={requestEndTime}
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
    </motion.div>
  );
}


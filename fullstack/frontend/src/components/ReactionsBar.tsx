import React from 'react';

const reactionIcons: Record<string, string> = {
  like: '👍',
  love: '❤️',
  funny: '😂',
  surprise: '😮',
  sad: '😢',
  angry: '😠',
};

export default function ReactionsBar({ reactions }: { reactions: string[] }) {
  if (reactions.length === 0) return null;
  
  // Count occurrences of each reaction type
  const reactionCounts: Record<string, number> = {};
  reactions.forEach(reaction => {
    reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
  });

  function handleReactionClick() {
    // Empty function for future implementation
  }

  return (
    <div className="reactions-bar">
      {Object.entries(reactionIcons).map(([key, icon]) =>
        reactionCounts[key] ? (
          <span 
            key={key} 
            className="reaction"
            onClick={handleReactionClick}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            {icon} <span style={{ fontSize: 13 }}>{reactionCounts[key]}</span>
          </span>
        ) : null
      )}
    </div>
  );
} 
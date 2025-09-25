import React, { useState } from 'react';
import { useDreamStore } from '../stores/dreamStore';

interface ShareableLink {
  id: string;
  dreamId: string;
  url: string;
  expiresAt: Date;
  permissions: 'view' | 'comment';
  isActive: boolean;
}

interface SharedDream {
  id: string;
  title: string;
  content: string;
  author: string;
  sharedAt: Date;
  likes: number;
  comments: Comment[];
  tags: string[];
}

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: Date;
}

export const DreamSharingFeatures: React.FC = () => {
  const { dreams } = useDreamStore();
  const [selectedDream, setSelectedDream] = useState<string>('');
  const [sharePermission, setSharePermission] = useState<'view' | 'comment'>('view');
  const [shareLinks, setShareLinks] = useState<ShareableLink[]>([]);
  const [communityDreams] = useState<SharedDream[]>([
    {
      id: '1',
      title: 'Flying Through Crystal Caves',
      content: 'I found myself soaring through magnificent crystal caves with rainbow reflections...',
      author: 'DreamExplorer23',
      sharedAt: new Date('2025-09-20'),
      likes: 15,
      comments: [
        {
          id: '1',
          author: 'LucidDreamer',
          content: 'This sounds like a beautiful lucid dream! I love the crystal imagery.',
          createdAt: new Date('2025-09-21')
        }
      ],
      tags: ['flying', 'crystals', 'lucid']
    },
    {
      id: '2',
      title: 'The Recurring Library',
      content: 'Once again I visited the infinite library with books that write themselves...',
      author: 'BookwormDreamer',
      sharedAt: new Date('2025-09-18'),
      likes: 8,
      comments: [],
      tags: ['recurring', 'library', 'books']
    }
  ]);

  const generateShareLink = () => {
    if (!selectedDream) return;

    const dream = dreams.find(d => d.id === selectedDream);
    if (!dream) return;

    const newLink: ShareableLink = {
      id: crypto.randomUUID(),
      dreamId: selectedDream,
      url: `https://dreamer.app/shared/${crypto.randomUUID()}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      permissions: sharePermission,
      isActive: true
    };

    setShareLinks([...shareLinks, newLink]);
  };

  const toggleLinkStatus = (linkId: string) => {
    setShareLinks(links => 
      links.map(link => 
        link.id === linkId 
          ? { ...link, isActive: !link.isActive }
          : link
      )
    );
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    // In a real app, show a toast notification
    alert('Link copied to clipboard!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Share Your Dreams */}
      <div style={{
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: '16px' }}>Share Your Dreams</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dream Selection */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              fontWeight: '500' 
            }}>
              Select Dream to Share:
            </label>
            <select
              value={selectedDream}
              onChange={(e) => setSelectedDream(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #ced4da',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            >
              <option value="">Choose a dream...</option>
              {dreams.map(dream => (
                <option key={dream.id} value={dream.id}>
                  {dream.title} ({new Date(dream.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          {/* Permission Selection */}
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontSize: '14px',
              fontWeight: '500' 
            }}>
              Sharing Permissions:
            </label>
            <div style={{ display: 'flex', gap: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name="permission"
                  value="view"
                  checked={sharePermission === 'view'}
                  onChange={(e) => setSharePermission(e.target.value as 'view' | 'comment')}
                />
                View Only
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  name="permission"
                  value="comment"
                  checked={sharePermission === 'comment'}
                  onChange={(e) => setSharePermission(e.target.value as 'view' | 'comment')}
                />
                View & Comment
              </label>
            </div>
          </div>

          {/* Generate Link Button */}
          <button
            onClick={generateShareLink}
            disabled={!selectedDream}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedDream ? '#2196F3' : '#ccc',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: selectedDream ? 'pointer' : 'not-allowed'
            }}
          >
            Generate Share Link
          </button>
        </div>
      </div>

      {/* Active Share Links */}
      {shareLinks.length > 0 && (
        <div style={{
          padding: '24px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ marginBottom: '16px' }}>Your Shared Dreams</h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {shareLinks.map(link => {
              const dream = dreams.find(d => d.id === link.dreamId);
              return (
                <div key={link.id} style={{
                  padding: '16px',
                  border: '1px solid #e9ecef',
                  borderRadius: '4px',
                  backgroundColor: link.isActive ? '#f8f9fa' : '#fff5f5'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div>
                      <h4 style={{ margin: 0, marginBottom: '4px' }}>
                        {dream?.title || 'Unknown Dream'}
                      </h4>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        <span>Permissions: {link.permissions}</span>
                        <span style={{ marginLeft: '16px' }}>
                          Expires: {link.expiresAt.toLocaleDateString()}
                        </span>
                        <span style={{ marginLeft: '16px' }}>
                          Status: {link.isActive ? 'Active' : 'Disabled'}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => copyToClipboard(link.url)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#28a745',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => toggleLinkStatus(link.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: link.isActive ? '#ffc107' : '#28a745',
                          color: link.isActive ? '#000' : '#ffffff',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        {link.isActive ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>
                  
                  <div style={{
                    fontSize: '12px',
                    color: '#6c757d',
                    fontFamily: 'monospace',
                    padding: '8px',
                    backgroundColor: '#f1f1f1',
                    borderRadius: '4px',
                    wordBreak: 'break-all'
                  }}>
                    {link.url}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Community Dreams */}
      <div style={{
        padding: '24px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ marginBottom: '16px' }}>Community Dreams</h3>
        <p style={{ 
          fontSize: '14px', 
          color: '#6c757d', 
          marginBottom: '20px' 
        }}>
          Explore dreams shared by other dreamers in our community
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {communityDreams.map(dream => (
            <div key={dream.id} style={{
              padding: '20px',
              border: '1px solid #e9ecef',
              borderRadius: '8px',
              backgroundColor: '#f8f9fa'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ margin: 0, marginBottom: '4px' }}>
                  {dream.title}
                </h4>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  By {dream.author} • {dream.sharedAt.toLocaleDateString()}
                </div>
              </div>

              <p style={{ 
                fontSize: '14px', 
                lineHeight: '1.5', 
                marginBottom: '12px',
                color: '#495057'
              }}>
                {dream.content}
              </p>

              {/* Tags */}
              <div style={{ marginBottom: '12px' }}>
                {dream.tags.map(tag => (
                  <span
                    key={tag}
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '12px',
                      fontSize: '12px',
                      marginRight: '8px',
                      color: '#495057'
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Engagement */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#6c757d' }}>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    color: '#6c757d',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    ❤️ {dream.likes}
                  </button>
                  <span>💬 {dream.comments.length} comment{dream.comments.length !== 1 ? 's' : ''}</span>
                </div>
                <button style={{
                  padding: '6px 12px',
                  backgroundColor: '#2196F3',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}>
                  View Full Dream
                </button>
              </div>

              {/* Comments Preview */}
              {dream.comments.length > 0 && (
                <div style={{
                  marginTop: '12px',
                  paddingTop: '12px',
                  borderTop: '1px solid #dee2e6'
                }}>
                  {dream.comments.slice(0, 2).map(comment => (
                    <div key={comment.id} style={{
                      fontSize: '12px',
                      marginBottom: '8px',
                      padding: '8px',
                      backgroundColor: '#ffffff',
                      borderRadius: '4px'
                    }}>
                      <strong>{comment.author}</strong>: {comment.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
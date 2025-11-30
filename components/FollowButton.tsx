'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { followUser, unfollowUser } from '@/app/actions/social';

interface FollowButtonProps {
  targetUserId: string;
  initialIsFollowing: boolean;
}

export function FollowButton({ targetUserId, initialIsFollowing }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const action = isFollowing ? unfollowUser : followUser;
      const result = await action(targetUserId);

      if (result?.error) {
        toast.error(result.error);
      } else {
        setIsFollowing(!isFollowing);
        toast.success(isFollowing ? 'Unfollowed' : 'Followed');
      }
    } catch (err) {
      toast.error('Failed to update follow status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`
        px-6 py-2 font-bold uppercase tracking-widest text-sm border border-black transition-all
        ${isFollowing 
          ? 'bg-white text-black hover:bg-gray-100' 
          : 'bg-black text-white hover:bg-gray-800'
        }
        disabled:opacity-50
      `}
    >
      {loading ? '...' : (isFollowing ? 'Unfollow' : 'Follow')}
    </button>
  );
}

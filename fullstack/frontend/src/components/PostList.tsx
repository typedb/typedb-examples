import React, { useEffect, useState } from 'react';
import Post from './Post';
import { ServiceContext } from "../service/ServiceContext";

export interface PostType {
  "post-data": {
    "post-text": string;
    "post-visibility": string;
    "post-image": string;
    "language": string;
    "tag": string[];
    "is-visible": boolean;
    "creation-timestamp": string;
    "post-id": string;
  }
  "author-name": string;
  "author-profile-picture": string;
  "author-id": string;
  "author-type": 'person' | 'organisation' | 'group';
  "reactions": string[];
}

interface PostListProps {
  pageId: string;
}

export default function PostList({ pageId }: PostListProps) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const serviceContext = React.useContext(ServiceContext);

  useEffect(() => {
    if (!pageId) {
      setPosts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    serviceContext.fetchPosts(pageId)
      .then((data: PostType[]) => {
        setPosts(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [pageId]);

  if (loading) return <ul><li>Loading...</li></ul>;
  if (error) return <ul><li>Error: {error}</li></ul>;
  if (!posts.length) return <ul><li>No posts yet.</li></ul>;

  return (
    <ul>
      {posts.map(post => (
        <li key={post["post-data"]["post-id"]}>
          <Post post={post} />
        </li>
      ))}
    </ul>
  );
} 

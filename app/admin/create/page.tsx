import { PostForm } from '@/components/PostForm';

export default function CreatePostPage() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-black p-8">
        <h1 className="text-4xl font-bold tracking-tighter">New Entry</h1>
      </header>
      <div className="p-8">
        <PostForm />
      </div>
    </div>
  );
}

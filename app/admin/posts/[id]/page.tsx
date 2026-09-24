"use client"

import { useParams } from "next/navigation"
import { PostForm } from "@/components/admin/post-form"

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>()
  return <PostForm key={id} postId={id} />
}

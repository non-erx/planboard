import type { Todo, Board, Tag } from '../types/Todo';

const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const createBoard = (name?: string) =>
  request<Board>('/boards', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });

export const getBoard = (boardId: string) =>
  request<Board>(`/boards/${encodeURIComponent(boardId)}`);

export const updateBoard = (boardId: string, name: string) =>
  request<Board>(`/boards/${encodeURIComponent(boardId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });

export const getTodos = (boardId: string) =>
  request<Todo[]>(`/boards/${encodeURIComponent(boardId)}/todos`);

export const addTodo = (boardId: string, title: string) =>
  request<Todo>(`/boards/${encodeURIComponent(boardId)}/todos`, {
    method: 'POST',
    body: JSON.stringify({ title, completed: false }),
  });

export const updateTodo = (boardId: string, todoId: number, data: Partial<Pick<Todo, 'title' | 'completed'>>) =>
  request<Todo>(`/boards/${encodeURIComponent(boardId)}/todos/${todoId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteTodo = (boardId: string, todoId: number) =>
  request<void>(`/boards/${encodeURIComponent(boardId)}/todos/${todoId}`, {
    method: 'DELETE',
  });

export const clearCompleted = (boardId: string) =>
  request<Todo[]>(`/boards/${encodeURIComponent(boardId)}/todos/completed`, {
    method: 'DELETE',
  });

export const getTags = (boardId: string) =>
  request<Tag[]>(`/boards/${encodeURIComponent(boardId)}/tags`);

export const createTag = (boardId: string, name: string, color: string) =>
  request<Tag>(`/boards/${encodeURIComponent(boardId)}/tags`, {
    method: 'POST',
    body: JSON.stringify({ name, color }),
  });

export const updateTag = (boardId: string, tagId: number, data: Partial<Pick<Tag, 'name' | 'color'>>) =>
  request<Tag>(`/boards/${encodeURIComponent(boardId)}/tags/${tagId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

export const deleteTag = (boardId: string, tagId: number) =>
  request<void>(`/boards/${encodeURIComponent(boardId)}/tags/${tagId}`, {
    method: 'DELETE',
  });

export const addTagToTodo = (boardId: string, todoId: number, tagId: number) =>
  request<Todo>(`/boards/${encodeURIComponent(boardId)}/todos/${todoId}/tags/${tagId}`, {
    method: 'POST',
  });

export const removeTagFromTodo = (boardId: string, todoId: number, tagId: number) =>
  request<Todo>(`/boards/${encodeURIComponent(boardId)}/todos/${todoId}/tags/${tagId}`, {
    method: 'DELETE',
  });

export const reorderTodos = (boardId: string, order: number[]) =>
  request<Todo[]>(`/boards/${encodeURIComponent(boardId)}/todos/reorder`, {
    method: 'PUT',
    body: JSON.stringify({ order }),
  });

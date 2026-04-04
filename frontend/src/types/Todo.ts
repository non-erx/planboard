export interface Tag {
  id: number;
  boardId: string;
  name: string;
  color: string;
}

export interface Todo {
  id: number;
  boardId: string;
  title: string;
  completed: boolean;
  sort_order: number;
  created_at: string;
  tags: Tag[];
}

export interface Board {
  id: string;
  name: string;
  created_at: string;
}

export type FilterType = 'all' | 'active' | 'completed';

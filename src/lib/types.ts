export type DroppedItem = {
  id: string;
  name: string;
  type: 'image' | 'file' | 'link';
  preview?: string;
  url?: string;
};

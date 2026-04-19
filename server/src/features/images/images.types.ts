export interface StorageImage {
  id: string;
  name: string;
  path: string;
  created_at: string;
}

export interface CreateImageDTO {
  name: string;
  path: string;
}

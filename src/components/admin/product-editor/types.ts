export interface TaxonomyOption {
  id: string;
  name: string;
  slug: string;
}

export interface EditableImage {
  storageKey: string;
  imageUrl: string;
  altText: string;
  isPrimary: boolean;
  sortOrder: number;
  width: number;
  height: number;
}

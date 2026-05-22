export type CategoryType = "INCOME" | "EXPENSE";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  userId: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryData = {
  name: string;
  type: CategoryType;
};

export type UpdateCategoryData = {
  name?: string;
  type?: CategoryType;
};
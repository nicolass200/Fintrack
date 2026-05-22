import { apiClient } from "./apiClient";
import type {
  Category,
  CreateCategoryData,
  UpdateCategoryData,
} from "../types/category";

export const categoryService = {
  list(token: string) {
    return apiClient<Category[]>("/categories", {
      method: "GET",
      token,
    });
  },

  create(token: string, data: CreateCategoryData) {
    return apiClient<Category>("/categories", {
      method: "POST",
      token,
      body: data,
    });
  },

  update(token: string, id: string, data: UpdateCategoryData) {
    return apiClient<Category>(`/categories/${id}`, {
      method: "PUT",
      token,
      body: data,
    });
  },

  remove(token: string, id: string) {
    return apiClient<null>(`/categories/${id}`, {
      method: "DELETE",
      token,
    });
  },
};
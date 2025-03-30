import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Use relative URL to allow the proxy to work
  withCredentials: true, // Include credentials if needed
});

export const fetchInventoryStats = async () => {
  const response = await api.get("/inventory/stats");
  return response.data;
};

export const fetchCategoryStats = async () => {
  const response = await api.get("/inventory/category-stats");
  return response.data;
};

import axios from "axios";
const isDev = process.env.NODE_ENV === "development";

export const api = axios.create({
  baseURL: "http://localhost:3333",
});

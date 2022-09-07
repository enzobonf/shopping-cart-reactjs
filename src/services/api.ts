import axios from "axios";
const isDev = process.env.NODE_ENV === "development";

export const api = axios.create({
  baseURL: isDev
    ? "http://localhost:3333"
    : "https://my-json-server.typicode.com/enzobonf/shopping-cart-reactjs",
});

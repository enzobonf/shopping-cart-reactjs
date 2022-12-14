import axios from "axios";
const isDev = process.env.NODE_ENV === "development";
console.log("isDev", isDev);

export const api = axios.create({
  baseURL: isDev
    ? "http://localhost:3333"
    : "http://my-json-server.typicode.com/enzobonf/shopping-cart-reactjs",
});

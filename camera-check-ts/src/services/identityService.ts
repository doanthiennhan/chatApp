
import { jwtDecode } from "jwt-decode";
import store from "../store";
import {
  setAccessToken as setAccessTokenRedux,
  removeAccessToken as removeAccessTokenRedux,
} from "../store";
import { createHttpClient, IDENTITY_BASE_URL } from "./http";
import { User } from "../types";
import { Console } from "console";

const identityApi = createHttpClient(IDENTITY_BASE_URL);

export const setAccessToken = (token: string) => {
  let userInfo: User | null = null;
  let roles: string[] | null = null;
  try {
    const decoded: any = jwtDecode(token);
    userInfo = {
      id: decoded.sub,
      email: decoded.email,
      username: decoded.username,
      role: decoded.roles.join(','),
    };
    roles = decoded.roles || null;
  } catch {
    // Do nothing
  }
  store.dispatch(setAccessTokenRedux({ token, userInfo, roles }));
  localStorage.setItem("accessToken", token);
};

export const getAccessToken = () => localStorage.getItem("accessToken");

export const removeAccessToken = () => {
  store.dispatch(removeAccessTokenRedux());
  localStorage.removeItem("accessToken");
};

export const signin = async (email: string, password: string) => {
  const res = await identityApi.post("/api/auth/signin", { email, password });
  const { accessToken } = res.data.data;
  setAccessToken(accessToken);
  return res.data;
};

export const signup = async (email: string, password: string) => {
  const res = await identityApi.post("/api/auth/signup", { email, password });
  return res.data;
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const logout = async () => {
  console.log("đăng xuất ");
  try {
    await identityApi.post("/api/auth/logout");
  } catch (error) {
    console.error("Logout API call failed, proceeding with local logout.", error);
  }
  removeAccessToken();
};

export const searchUsers = (search = '', page = 1, size = 10) => 
  identityApi.get(`/users?search=${search}&page=${page}&size=${size}`);

export default identityApi;
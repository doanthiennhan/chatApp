import { createHttpClient, IDENTITY_BASE_URL } from "./http";

const userApi = createHttpClient(`${IDENTITY_BASE_URL}/users`);

userApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            (config.headers as any).Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const fetchUsers = async (page = 1, size = 30) => {
    const res = await userApi.get("/", {
        params: { page, size },
    });
    return res.data.data;
}

export const fetchUserByName = async (name: string) => {
    const res = await userApi.get(`/${name}`);
    return res.data.data;
}

export const updateUser = async (userId: string, userData: any) => {
    const res = await userApi.put(`/${userId}`, userData);
    return res.data.data;
}

export const deleteUser = async (userId: string) => {
    const res = await userApi.delete(`/${userId}`);
    return res.data.data;
}

export const getUserProfile = async (userId: string) => {
    const res = await userApi.get(`/${userId}`);
    return res.data.data;
}

export const getActivityHistory = async (userId: string) => {
    const res = await userApi.get(`/${userId}/activity-history`);
    return res.data.data;
}

export const changePassword = async (currentPassword: string, newPassword: string) => {
    const res = await userApi.post('/change-password', { currentPassword, newPassword });
    return res.data.data;
}

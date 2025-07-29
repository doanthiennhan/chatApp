import axios from "axios";
const userApi = axios.create({
    baseURL: "http://localhost:8080/identity/api/users",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

userApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    }
});

export const fetchUsers = async (page = 0, size = 30) => {
    const res = await userApi.get("/", {
        params: { page, size },
    });
    return res.data.data;
}

export const fetchUserByName = async (name) => {
    const res = await userApi.get(`/${name}`);
    return res.data.data;
}

export const updateUser = async (userId, userData) => {
    const res = await userApi.put(`/${userId}`, userData);
    return res.data.data;
}

export const deleteUser = async (userId) => {
    const res = await userApi.delete(`/${userId}`);
    return res.data.data;
}



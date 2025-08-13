import axios from "axios";
import "../types"; // Import JSDoc types

const userApi = axios.create({
    baseURL: "http://localhost:8080/identity/users",
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
    },
    (error) => Promise.reject(error)
);

/**
 * Fetches a list of users.
 * @param {number} [page=0] - The page number.
 * @param {number} [size=30] - The number of users per page.
 * @returns {Promise<User[]>} A promise that resolves to an array of user objects.
 */
export const fetchUsers = async (page = 0, size = 30) => {
    const res = await userApi.get("/", {
        params: { page, size },
    });
    return res.data.data;
}

/**
 * Fetches a user by their name.
 * @param {string} name - The username of the user to fetch.
 * @returns {Promise<User>} A promise that resolves to the user object.
 */
export const fetchUserByName = async (name) => {
    const res = await userApi.get(`/${name}`);
    return res.data.data;
}

/**
 * Updates a user's data.
 * @param {string} userId - The ID of the user to update.
 * @param {Partial<User>} userData - The user data to update.
 * @returns {Promise<User>} A promise that resolves to the updated user object.
 */
export const updateUser = async (userId, userData) => {
    const res = await userApi.put(`/${userId}`, userData);
    return res.data.data;
}

/**
 * Deletes a user by their ID.
 * @param {string} userId - The ID of the user to delete.
 * @returns {Promise<any>} A promise that resolves when the user is deleted.
 */
export const deleteUser = async (userId) => {
    const res = await userApi.delete(`/${userId}`);
    return res.data.data;
}

/**
 * Fetches a user's profile.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<User>} A promise that resolves to the user's profile object.
 */
export const getUserProfile = async (userId) => {
    const res = await userApi.get(`/${userId}`);
    return res.data.data;
}

/**
 * Fetches a user's activity history.
 * @param {string} userId - The ID of the user.
 * @returns {Promise<ActivityHistoryItem[]>} A promise that resolves to an array of activity history items.
 */
export const getActivityHistory = async (userId) => {
    const res = await userApi.get(`/${userId}/activity-history`);
    return res.data.data;
}

/**
 * Changes a user's password.
 * @param {string} currentPassword - The user's current password.
 * @param {string} newPassword - The user's new password.
 * @returns {Promise<any>} A promise that resolves when the password is changed.
 */
export const changePassword = async (currentPassword, newPassword) => {
    const res = await userApi.post('/change-password', { currentPassword, newPassword });
    return res.data.data;
}

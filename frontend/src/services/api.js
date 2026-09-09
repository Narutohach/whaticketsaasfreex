import axios from "axios";

const api = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL,
	withCredentials: true,
});

let refreshPromise = null;

const clearAuthentication = () => {
	localStorage.removeItem("token");
	localStorage.removeItem("companyId");
	localStorage.removeItem("userId");
	api.defaults.headers.Authorization = undefined;
};

// A instância é global: estes interceptors devem ser registrados uma única vez.
api.interceptors.request.use(
	config => {
		const token = localStorage.getItem("token");
		if (token) config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
		return config;
	},
	error => Promise.reject(error)
);

api.interceptors.response.use(
	response => response,
	async error => {
		const originalRequest = error.config;
		const isRefreshRequest = originalRequest?.url === "/auth/refresh_token";

		if (error?.response?.status === 403 && originalRequest && !originalRequest._retry && !isRefreshRequest) {
			originalRequest._retry = true;
			try {
				if (!refreshPromise) {
					refreshPromise = api.post("/auth/refresh_token")
						.then(({ data }) => {
							localStorage.setItem("token", JSON.stringify(data.token));
							api.defaults.headers.Authorization = `Bearer ${data.token}`;
						})
						.finally(() => { refreshPromise = null; });
				}
				await refreshPromise;
				return api(originalRequest);
			} catch (refreshError) {
				clearAuthentication();
				return Promise.reject(refreshError);
			}
		}

		if (error?.response?.status === 401) {
			clearAuthentication();
			if (window.location.pathname !== "/login") window.location.assign("/login");
		}
		return Promise.reject(error);
	}
);

export const openApi = axios.create({
	baseURL: process.env.REACT_APP_BACKEND_URL
});

export default api;

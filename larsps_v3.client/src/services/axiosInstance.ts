import axios, { AxiosResponse } from 'axios';
import { PaginationResult } from "./paginationResponse.ts";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL, 
    headers: {
        "Content-Type": "application/json",
    },

});

let isInterceptorSetup = false;

const setupResponseInterceptor = () => {
    if (!isInterceptorSetup) {
        axiosInstance.interceptors.response.use(
            (response: AxiosResponse) => {
                //console.log("Response received:", response);

                const paginationParams = response.headers["x-pagination"];
                if (paginationParams) {
                    response.data = new PaginationResult(response.data, JSON.parse(paginationParams));
                    return response as AxiosResponse<PaginationResult<any>>;
                }
                return response;
            },
            (error) => {
                if (error.response) {
                    const statusCode = error.response.status;
                    const data = error.response.data;

                    console.error(`Error ${statusCode}:`, data);

                    switch (statusCode) {
                        case 400:
                            if (data.errors) {
                                const modalStateErrors: { property: string; errorMessage: string }[] = [];
                                for (const key in data.errors) {
                                    if (Object.prototype.hasOwnProperty.call(data.errors, key)) {
                                        const errorMessages: string[] = data.errors[key];
                                        errorMessages.forEach((message) => {
                                            modalStateErrors.push({ property: key, errorMessage: message });
                                        });
                                    }
                                }
                                console.log("Validation Errors:", modalStateErrors);
                            }
                            break;
                        case 401:
                            console.warn("Unauthorized access - Redirecting to login.");
                            // Optional: Redirect to login page
                            break;
                        case 403:
                            console.warn("Forbidden access - You do not have permission.");
                            break;
                        case 404:
                            console.warn("Resource not found.");
                            break;
                        default:
                            console.error("An unexpected error occurred.");
                            break;
                    }
                } else if (error.request) {
                    // Network errors (e.g., server down)
                    console.error("Network error: No response received from the server.");
                } else {
                    // Axios configuration errors
                    console.error("Axios configuration error:", error.message);
                }
                return Promise.reject(error);
            }
        );

        isInterceptorSetup = true;
    }
};

setupResponseInterceptor();

export default axiosInstance;

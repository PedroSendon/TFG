// authFetch.ts
let isRefreshingToken = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const onAccessTokenFetched = (access_token: string) => {
    refreshSubscribers.forEach(callback => callback(access_token));
    refreshSubscribers = [];
};

const addRefreshSubscriber = (callback: (token: string) => void) => {
    refreshSubscribers.push(callback);
};

interface FetchOptions extends RequestInit {
    headers?: Record<string, string>;
}

export const authenticatedFetch = async (url: string, options: FetchOptions = {}) => {
    let accessToken = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');

    if (!accessToken) {
        throw new Error("No access token found");
    }

    const headers = {
        ...options.headers,
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    };

    let response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401) {
        console.log("Access token expired, attempting to refresh...");

        if (!isRefreshingToken) {
            isRefreshingToken = true;
            const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');

            if (!refreshToken) {
                throw new Error("No refresh token found");
            }

            // Realiza la solicitud de renovación del token
            const refreshResponse = await fetch('http://127.0.0.1:8000/api/token/refresh/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (refreshResponse.ok) {
                const refreshData = await refreshResponse.json();
                const storage = localStorage.getItem('refresh_token') ? localStorage : sessionStorage;
                storage.setItem('access_token', refreshData.access);

                isRefreshingToken = false;
                onAccessTokenFetched(refreshData.access);

                // Actualiza el token en la solicitud original
                headers['Authorization'] = `Bearer ${refreshData.access}`;
                response = await fetch(url, {
                    ...options,
                    headers,
                });
            } else {
                isRefreshingToken = false;
                throw new Error("Unable to refresh token");
            }
        } else {
            // Espera hasta que el token se haya actualizado
            response = await new Promise((resolve) => {
                addRefreshSubscriber(async (newAccessToken) => {
                    headers['Authorization'] = `Bearer ${newAccessToken}`;
                    const retryResponse = await fetch(url, {
                        ...options,
                        headers,
                    });
                    resolve(retryResponse);
                });
            });
        }
    }

    return response;
};

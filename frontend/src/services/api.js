const API_URL = "http://127.0.0.1:5001"

export const predictImage = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch(`${API_URL}/predict`, {
            method: "POST",
            body: formData,
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
            // Prefer the backend's "message" or "error", fallback to status text
            const errorMessage = data?.message || data?.error || `Request failed with status ${response.status}`;
            throw new Error(errorMessage);
        }

        return data;
    } catch (error) {
        console.error("API Error:", error);
        throw error; // Re-throw so component can handle it
    }
};

import { NewCartItem, NewCartItemWrapper } from "../types";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export async function addToCart(data: NewCartItem, authToken: string): Promise<NewCartItemWrapper | null> {
    // Debug: Log what we are sending to ensure token is a string and data is correct
    console.log("Adding to Cart:", {
        url: `${BACKEND_URL}/api/cart`,
        payload: data,
        tokenLength: authToken?.length,
        tokenPreview: authToken ? `${authToken.substring(0, 10)}...` : "MISSING"
    });

    try {
        const response = await fetch(`${BACKEND_URL}/api/cart`, {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
        });

        if (!response.ok) {
            // Try to parse error, fallback to text if JSON fails
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = await response.text();
            }

            console.error(`Failed to add to cart (Status: ${response.status}):`, errorData);
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error("Network error adding to cart:", error);
        return null;
    }
}

export async function getAllUsers() {
    const response = await fetch("/api/administrator/users/all", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
    });

    if (response.ok) {
        const data = await response.json();
        return data;
    }
}
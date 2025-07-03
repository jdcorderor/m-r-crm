export async function handleLogout() {
    try {
        const response = await fetch("/api/auth/logout", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (response.ok) {
            return
        }
    } catch(error) {
        console.error("Error:", error)
    }
}
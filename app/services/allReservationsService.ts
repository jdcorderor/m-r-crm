export async function getAllReservations() {
    const response = await fetch("/api/reservations/all", {
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
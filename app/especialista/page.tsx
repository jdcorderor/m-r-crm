"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import HeaderB from "@/components/headerB";
import 'bootstrap-icons/font/bootstrap-icons.css';

export default function DashboardB() {
    // Router
    const router = useRouter();

    // State variable for user role
    const [user, setUser] = useState({
        username: "",
        role: "",
    });

    // User verification handler
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const response = await fetch("/api/auth/verify", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    credentials: "include",
                });
                if (response.ok) {
                    const data = await response.json();
                    setUser(user => ({
                        ...user,
                        username: data.message.username,
                        role: data.message.role,
                    }));
                } else {
                    router.push("/login");
                }
            } catch (error) {
                console.error("Error:", error);
                router.push("/login");
            }
        };
        verifyAuth();
    }, [router]);

    // ---------------------------------------------------------------------------

    // Verify user variable
    if (user.username === "" && user.role === "") return null;

    return (
        <div>
            {/* Header */}
        </div>
    );
}
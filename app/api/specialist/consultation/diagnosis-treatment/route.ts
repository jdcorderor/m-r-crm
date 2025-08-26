import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        const dir = path.resolve(process.cwd(), "data");
        const filePath = path.join(dir, "consultation.json");

        if (!fs.existsSync(dir)) {
            return NextResponse.json({ message: "Data directory not found" }, { status: 404 });
        }

        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ message: "consultation.json not found" }, { status: 404 });
        }

        const existingRaw = fs.readFileSync(filePath, "utf-8");
        const existingData = JSON.parse(existingRaw);

        return NextResponse.json(existingData, { status: 200 });
    } catch (error) {
        console.error("Error reading consultation.json:", error);
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

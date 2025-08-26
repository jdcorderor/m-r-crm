import { Client } from "pg";
import { NextResponse, NextRequest } from "next/server";

// Define types for the odontogram structure
type Segmento = { [segmentoId: string]: number };
type Diente = { segmentos: Segmento };
type Sector = { dientes: Diente[] };
type Odontograma = { [sectorId: string]: Sector };
type OdontogramaRow = {
    sector_nombre: string;
    diente_nombre: string;
    segmento_nombre: string;
    valor_afectacion: number;
};

// Function to convert database rows to JSON format
function convertToJSON(rows: OdontogramaRow[]): Odontograma {
    const resultado: Odontograma = {};

    for (const row of rows) {
        const sectorId = row.sector_nombre;
        const dienteId = row.diente_nombre;
        const segmentoId = row.segmento_nombre;
        const valor = row.valor_afectacion;

        if (!resultado[sectorId]) {
            resultado[sectorId] = { dientes: [] };
        }

        const dientes = resultado[sectorId].dientes;

        const toothName = parseInt(dienteId);
        if (!dientes[toothName]) {
            dientes[toothName] = { segmentos: {} };
        }

        dientes[toothName].segmentos[segmentoId] = valor;
    }

    return resultado;
}

// GET Route
export async function GET(request: NextRequest, { params }: { params: Promise<{id: number}> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { id } = await params;

    try {
        await client.connect();

        const query = `
            SELECT 
                s.nombre AS sector_nombre,
                d.nombre AS diente_nombre,
                seg.nombre AS segmento_nombre,
                seg.valor_afectacion
            FROM historias h
            JOIN odontodiagramas o ON h.odontodiagrama_id = o.id
            JOIN sectores s ON s.odontodiagrama_id = o.id
            JOIN dientes d ON d.sector_id = s.id
            JOIN segmentos seg ON seg.diente_id = d.id
            WHERE h.codigo = $1
            ORDER BY s.nombre::int, d.nombre::int, seg.nombre::int;
        `;

        const results = await client.query(query, [id]);

        return NextResponse.json(convertToJSON(results.rows), { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}

// POST Route
export async function POST(): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();

        const odontogramResult = await client.query("INSERT INTO odontodiagramas RETURNING id");
        const odontogram = odontogramResult.rows[0].id;

        for (let i = 0; i <= 7; i++) {
            const sectorsResults = await client.query("INSERT INTO sectores (nombre, odontodiagrama_id) VALUES ($1, $2) RETURNING id", [`${i}`, odontogram]);
            const sector = sectorsResults.rows[0].id;
            
            if (i < 4) {
                for (let j = 0; j <= 7; j++) {
                    const teethResult = await client.query("INSERT INTO dientes (nombre, sector_id) VALUES ($1, $2) RETURNING id", [`${j}`, sector]);
                    const tooth = teethResult.rows[0].id;

                    for (let k = 0; k <= 7; k++) {
                        await client.query("INSERT INTO segmentos (nombre, valor_afectacion, diente_id) VALUES ($1, $2, $3)", [`${k}`, 0, tooth]);
                    }
                }
            } else {
                for (let j = 0; j <= 4; j++) {
                    const teethResult = await client.query("INSERT INTO dientes (nombre, sector_id) VALUES ($1, $2) RETURNING id", [`${j}`, sector]);
                    const tooth = teethResult.rows[0].id;

                    for (let k = 0; k <= 7; k++) {
                        await client.query("INSERT INTO segmentos (nombre, valor_afectacion, diente_id) VALUES ($1, $2, $3)", [`${k}`, 0, tooth]);
                    }
                }
            }
        }

        return NextResponse.json({ message: "OK" });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}

// PUT Route
export async function PUT(request: NextRequest, { params }: { params: Promise<{id: number}> }): Promise<NextResponse> {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    const { id } = await params;

    try {
        const data = await request.json();

        await client.connect();

        // --------------------------------------------------------------------------

        // Get odontogram ID from medical record
        const recordResult = await client.query("SELECT odontodiagrama_id FROM historias WHERE codigo = $1", [id]);

        if (recordResult.rowCount === 0) {
            return NextResponse.json({ error: "Medical record not found" }, { status: 404 });
        }

        const odontodiagramaID = recordResult.rows[0].odontodiagrama_id;

        // --------------------------------------------------------------------------

        // Get current odontogram data
        const results = await client.query(`
            SELECT 
                s.nombre AS sector_nombre,
                d.nombre AS diente_nombre,
                seg.nombre AS segmento_nombre,
                seg.valor_afectacion
            FROM historias h
            JOIN odontodiagramas o ON h.odontodiagrama_id = o.id
            JOIN sectores s ON s.odontodiagrama_id = o.id
            JOIN dientes d ON d.sector_id = s.id
            JOIN segmentos seg ON seg.diente_id = d.id
            WHERE h.codigo = $1
            ORDER BY s.nombre::int, d.nombre::int, seg.nombre::int;
        `, [id]);

        const current = convertToJSON(results.rows);

        // --------------------------------------------------------------------------

        // Filter sectors, teeth and segments that have been modified
        const filtered = Object.entries(data as Record<string, Sector>).map(([sectorName, sectorValue]) => {
            const currentSector = current[(Number(sectorName) - 1).toString()];
            
            if (!currentSector) {
                return {
                    sectorName,
                    modifiedTeeth: sectorValue.dientes.map((diente, dienteIndex) => ({
                        dienteIndex,
                        modifiedSegments: Object.entries(diente.segmentos).map(([segmentoId, valor]) => ({
                            segmentoId,
                            valor
                        }))
                    }))
                };
            }

            const modifiedTeeth = sectorValue.dientes.map((diente, dienteIndex) => {
                const currentDiente = currentSector.dientes[dienteIndex];
               
                if (!currentDiente) {
                    return {
                        dienteIndex,
                        modifiedSegments: Object.entries(diente.segmentos).map(([segmentoId, valor]) => ({
                            segmentoId,
                            valor
                        }))
                    };
                }

                const modifiedSegments = Object.entries(diente.segmentos).filter(([segmentoId, valor]) => currentDiente.segmentos[segmentoId] !== valor).map(([segmentoId, valor]) => ({segmentoId, valor}));
                
                if (modifiedSegments.length > 0) {
                    return { dienteIndex, modifiedSegments };
                }

                return null;

            }).filter(Boolean) as { dienteIndex: number, modifiedSegments: { segmentoId: string, valor: number }[] }[];
            
            if (modifiedTeeth.length > 0) {
                return { sectorName, modifiedTeeth };
            }

            return null;
            
        }).filter(Boolean) as {
            sectorName: string,
            modifiedTeeth: {
                dienteIndex: number,
                modifiedSegments: { segmentoId: string, valor: number }[]
            }[]
        }[];

        // If no sectors, teeth or segments were modified, return OK
        if (filtered.length === 0) {
            return NextResponse.json({ message: "No changes detected" }, { status: 200 });
        }

        // Update or insert modified sectors, teeth and segments
        for (const { sectorName, modifiedTeeth } of filtered) {
            const sectorResults = await client.query("SELECT id FROM sectores WHERE nombre = $1 AND odontodiagrama_id = $2", [(Number(sectorName) - 1).toString(), odontodiagramaID]);
            const sectorID = sectorResults.rows[0].id;

            for (const { dienteIndex, modifiedSegments } of modifiedTeeth) {
                const teethResults = await client.query("SELECT id FROM dientes WHERE nombre = $1 AND sector_id = $2", [dienteIndex.toString(), sectorID]);

                let toothID: number;

                if (teethResults.rowCount === 0) {
                    const insertTooth = await client.query("INSERT INTO dientes (nombre, sector_id) VALUES ($1, $2) RETURNING id", [dienteIndex.toString(), sectorID]);
                    toothID = insertTooth.rows[0].id;
                } else {
                    toothID = teethResults.rows[0].id;
                }

                for (const { segmentoId, valor } of modifiedSegments) {
                    const segmentResults = await client.query("SELECT id FROM segmentos WHERE nombre = $1 AND diente_id = $2", [segmentoId, toothID]);

                    if (segmentResults.rowCount === 0) {
                        await client.query("INSERT INTO segmentos (nombre, valor_afectacion, diente_id) VALUES ($1, $2, $3)", [segmentoId, valor, toothID]);
                    } else {
                        await client.query("UPDATE segmentos SET valor_afectacion = $1 WHERE id = $2", [valor, segmentResults.rows[0].id]);
                    }
                }
            }
        }

        return NextResponse.json({ message: "OK" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}
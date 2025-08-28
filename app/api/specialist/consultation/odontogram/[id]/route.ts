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

// Function to get segment labels
function getSegmentLabels(tooth: number, segment: number): string {
    let label: string;

    switch (segment) {
        case 1:
            if (tooth.toString().endsWith("1") || tooth.toString().endsWith("2") || tooth.toString().endsWith("3")) {
                label = "Incisal"
            } else {
                label = "Oclusal";
            }
            break;

        case 2:
            if (tooth.toString().startsWith("1") || tooth.toString().startsWith("4") || tooth.toString().startsWith("5") || tooth.toString().startsWith("8")) {
                label = "Mesial";
            } else {
                label = "Distal";
            }
            break;

        case 3:
            if (tooth.toString().startsWith("1") || tooth.toString().startsWith("2") || tooth.toString().startsWith("5") || tooth.toString().startsWith("6")) {
                label = "Palatina"; // Palatino
            } else {
                label = "Lingual";
            }
            break;

        case 4:
            if (tooth.toString().startsWith("2") || tooth.toString().startsWith("3") || tooth.toString().startsWith("6") || tooth.toString().startsWith("7")) {
                label = "Mesial";
            } else {
                label = "Distal";
            }
            break;

        case 5:
            label = "Vestibular";
            break;

        default:
            label = "";
    }

    return label;
}

// Function to get the treatment or diagnosis for a segment
function getTD(valor: number, toothLabel: string,  segmentLabel: string, diagnosis: string[], treatment: string[]): [string[], string[]] {
    switch (valor) {
        case 0:
            diagnosis = diagnosis.filter(d => !(d.includes(segmentLabel.toLowerCase()) && d.endsWith(toothLabel)));
            treatment = treatment.filter(t => !(t.includes(segmentLabel.toLowerCase()) && t.endsWith(toothLabel)));
            break;
        case 1:
            diagnosis.push(`Caries ${segmentLabel.toLowerCase()} - ${toothLabel}`);
            break;
        case 2:
            treatment.push(`Restauración ${segmentLabel.toLowerCase()} - ${toothLabel}`);
            break
        case 3:
            diagnosis.push(`Restauración ${segmentLabel.toLowerCase()} defectuosa - ${toothLabel}`);
            break;
    }

    return [diagnosis, treatment];
}

// Function to get the treatment or diagnosis for a full tooth
function getTDFullTooth(valor: number, toothLabel: string, diagnosis: string[], treatment: string[]): [string[], string[]] {
    switch (valor) {
        case 0:
            diagnosis = diagnosis.filter(d => !(d.endsWith(toothLabel)));
            treatment = treatment.filter(t => !(t.endsWith(toothLabel)));
            break;
        case 4:
            treatment.push(`Exodoncia realizada - ${toothLabel}`);
            break;
        case 5:
            diagnosis.push(`Exodoncia indicada - ${toothLabel}`);
            break;
        case 6:
            treatment.push(`Endodoncia realizada - ${toothLabel}`);
            break;
        case 7:
            diagnosis.push(`Endodoncia indicada - ${toothLabel}`);
            break;
        case 8:
            treatment.push(`Corona/prótesis fija - ${toothLabel}`);
            break;
        case 9:
            diagnosis.push(`Corona/prótesis fija indicada - ${toothLabel}`);
            break;
        case 10:
            diagnosis.push(`Diente en erupción - ${toothLabel}`);
            break;
        case 11:
            diagnosis.push(`Diente en erupción con inflamación - ${toothLabel}`);
            break;
        case 14:
            diagnosis.push(`Diente fracturado - ${toothLabel}`);
            break;
    }

    return [diagnosis, treatment];
}

// --------------------------------------------------------------------------

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

        // Get treatment and diagnosis
        const result = await client.query(`
            SELECT 
                dt.diagnostico, 
                dt.tratamiento 
            FROM historias h
            LEFT JOIN diagnostico_tratamiento dt ON dt.historia_id = h.id
            WHERE h.codigo = $1 LIMIT 1
        `, [id]);

        let diagnosis: string[] = [];
        let treatment: string[] = [];
        
        if (result.rows.length !== 0) {
            diagnosis = result.rows[0].diagnostico ?? [];
            treatment = result.rows[0].tratamiento ?? [];
        }

        for (const { sectorName, modifiedTeeth } of filtered) {
            for (const { dienteIndex, modifiedSegments } of modifiedTeeth) {
                for (const { segmentoId, valor } of modifiedSegments) {
                    const toothLabel = (Number(sectorName) * 10) + Number(dienteIndex + 1);
                    
                    if ([0, 4, 5, 6, 7, 8, 9, 10, 11, 14].includes(valor)) {
                        [diagnosis, treatment] = getTDFullTooth(valor, toothLabel.toString(), diagnosis, treatment);
                        break;
                    } else {
                        const segmentLabel = getSegmentLabels((Number(sectorName) * 10) + Number(dienteIndex + 1), Number(segmentoId));
                        [diagnosis, treatment] = getTD(valor, toothLabel.toString(), segmentLabel, diagnosis, treatment);
                    }
                }
            }
        }

        const recordIDResult = await client.query("SELECT id FROM historias WHERE codigo = $1", [id]);

        const recordID = recordIDResult.rows[0].id;

        const existingDT = await client.query(`
            SELECT 1 FROM diagnostico_tratamiento WHERE historia_id = $1 LIMIT 1
        `, [recordID]);

        if (existingDT.rows.length > 0) {
            await client.query(
                "UPDATE diagnostico_tratamiento SET diagnostico = $1, tratamiento = $2 WHERE historia_id = $3",
                [diagnosis, treatment, recordID]
            );
        } else {
            await client.query(
                "INSERT INTO diagnostico_tratamiento (historia_id, diagnostico, tratamiento) VALUES ($1, $2, $3)",
                [recordID, diagnosis, treatment]
            );
        }

        return NextResponse.json({ message: "OK" }, { status: 200 });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ error: error }, { status: 500 });
    } finally {
        await client.end();
    }
}
"use client";

import { Fragment, useEffect, useState } from "react";
import Button from "@/components/ui/button";
import { Plus } from "lucide-react";

// Tipados para los datos
type Segmentos = Record<number, number>;
interface Diente {
  segmentos: Segmentos;
}

interface SectorData {
  dientes: Diente[];
}

interface OdontodiagramaProps {
  onChange: (data: Record<number, SectorData>) => void;
  readOnly?: boolean;
  initialData?: Record<
    number,
    { dientes: Record<number, { segmentos: Record<number, number> }> }
  >;
}

export function Odontodiagrama({
  onChange,
  readOnly = false,
  initialData,
}: OdontodiagramaProps) {
  const [sectores, setSectores] = useState<Record<number, SectorData>>(() => {
    const result: Record<number, SectorData> = {};
    [1, 2, 3, 4, 5, 6, 7, 8].forEach((sectorKey) => {
      const count = sectorKey <= 4 ? 8 : 5;

      if (initialData && initialData[sectorKey]?.dientes) {
        const dientesArray = Object.entries(initialData[sectorKey].dientes)
          .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB))
          .map(([, dienteData]) => ({ segmentos: { ...dienteData.segmentos } }));
        result[sectorKey] = { dientes: dientesArray };
      } else {
        result[sectorKey] = {
          dientes: Array.from({ length: count }, () => ({
            segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          })),
        };
      }
    });
    return result;
  });

  const [valorSeleccionado, setValorSeleccionado] = useState<number>(1);

  useEffect(() => {
    console.log("Sectores actualizados:", JSON.parse(JSON.stringify(sectores)));
  }, [sectores]); // Se ejecutará cada vez que sectores cambie

  useEffect(() => {
    onChange(sectores);
  }, [sectores, onChange]);

  const isFullToothValue = (value: number) => {
    return [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].includes(value);
  };

  const cambiarSegmento = (sector: number, dienteIndex: number, segmento: number) => {
    if (readOnly) return;

    setSectores((prev) => {
      // 1. Copia profunda del estado
      const newSectores = JSON.parse(JSON.stringify(prev));

      // 2. Actualiza SOLO el segmento clickeado (o todos si es fullToothValue)
      if (isFullToothValue(valorSeleccionado)) {
        Object.keys(newSectores[sector].dientes[dienteIndex].segmentos).forEach((seg) => {
          newSectores[sector].dientes[dienteIndex].segmentos[seg] = valorSeleccionado;
        });
      } else {
        newSectores[sector].dientes[dienteIndex].segmentos[segmento] = valorSeleccionado;
      }

      return newSectores;
    });
  };

  // Agregar diente al final
  const agregarDiente = (sector: number) => {
    if (readOnly) return;
    setSectores((prev) => {
      const copia = { ...prev };
      copia[sector] = {
        dientes: [
          ...copia[sector].dientes,
          { segmentos: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } },
        ],
      };
      return copia;
    });
  };

  // Eliminar diente por índice
  const eliminarDiente = (sector: number, index: number) => {
    if (readOnly) return;
    setSectores((prev) => {
      const copia = { ...prev };
      copia[sector] = {
        dientes: copia[sector].dientes.filter((_, i) => i !== index),
      };
      return copia;
    });
  };

  // Path SVG para cada segmento
  const getSegmentPath = (segmento: number) => {
    const cx = 25;
    const cy = 25;
    const rInner = 8;
    const rOuter = 20;
    const rExt = 30;
    switch (segmento) {
      case 1:
        return `M ${cx} ${cy}
        m -${rInner}, 0
        a ${rInner},${rInner} 0 1,0 ${rInner * 2},0
        a ${rInner},${rInner} 0 1,0 -${rInner * 2},0 Z`;
      case 2:
        return `M ${cx + rInner * Math.cos(Math.PI / 4)} ${
          cy - rInner * Math.sin(Math.PI / 4)
        } 
        A ${rInner} ${rInner} 0 0 1 ${cx + rInner * Math.cos(Math.PI / 4)} ${
          cy - rInner * Math.sin(-Math.PI / 4)
        } 
        L ${cx + rOuter * Math.cos(-Math.PI / 4)} ${
          cy - rOuter * Math.sin(-Math.PI / 4)
        } 
        A ${rOuter} ${rOuter} 0 0 0 ${cx + rOuter * Math.cos(Math.PI / 4)} ${
          cy - rOuter * Math.sin(Math.PI / 4)
        } 
        Z`;
      case 3:
        return `M ${cx + rInner * Math.cos(-Math.PI / 4)} ${
          cy - rInner * Math.sin(-Math.PI / 4)
        }
        A ${rInner} ${rInner} 0 0 1 ${
          cx + rInner * Math.cos((-3 * Math.PI) / 4)
        } ${cy - rInner * Math.sin((-3 * Math.PI) / 4)}
        L ${cx + rOuter * Math.cos((-3 * Math.PI) / 4)} ${
          cy - rOuter * Math.sin((-3 * Math.PI) / 4)
        } 
        A ${rOuter} ${rOuter} 0 0 0 ${cx + rOuter * Math.cos(-Math.PI / 4)} ${
          cy - rOuter * Math.sin(-Math.PI / 4)
        } 
        Z`;
      case 4:
        return `M ${cx + rInner * Math.cos((-3 * Math.PI) / 4)} ${
          cy - rInner * Math.sin((-3 * Math.PI) / 4)
        }
          A ${rInner} ${rInner} 0 0 1 ${
          cx - rInner * Math.cos((1 * Math.PI) / 4)
        } ${cy - rInner * Math.sin((1 * Math.PI) / 4)}
          L ${cx - rOuter * Math.cos((1 * Math.PI) / 4)} ${
          cy - rOuter * Math.sin((1 * Math.PI) / 4)
        }
          A ${rOuter} ${rOuter} 0 0 0 ${
          cx + rOuter * Math.cos((-3 * Math.PI) / 4)
        } ${cy - rOuter * Math.sin((-3 * Math.PI) / 4)} 
          Z`;
      case 5:
        return `M ${cx - rInner * Math.cos((1 * Math.PI) / 4)} ${
          cy - rInner * Math.sin((1 * Math.PI) / 4)
        }
          A ${rInner} ${rInner} 0 0 1 ${
          cx - rInner * Math.cos((3 * Math.PI) / 4)
        } ${cy - rInner * Math.sin((3 * Math.PI) / 4)}
          L ${cx - rOuter * Math.cos((3 * Math.PI) / 4)} ${
          cy - rOuter * Math.sin((3 * Math.PI) / 4)
        }
          A ${rOuter} ${rOuter} 0 0 0 ${
          cx - rOuter * Math.cos((1 * Math.PI) / 4)
        } ${cy - rOuter * Math.sin((1 * Math.PI) / 4)} 
          Z`;
      case 6:
        return `M ${cx} ${cy - rOuter} A ${rOuter} ${rOuter} 0 0 1 ${
          cx + rOuter
        } ${cy} L ${cx + rExt * 0.7071} ${
          cy - rExt * 0.7071
        } A ${rExt} ${rExt} 0 0 0 ${cx - rExt * 0.7071} ${
          cy - rExt * 0.7071
        } L ${cx - rOuter} ${cy} A ${rOuter} ${rOuter} 0 0 1 ${cx} ${
          cy - rOuter
        } Z`;
      case 7:
        return `M ${cx} ${cy + rOuter} A ${rOuter} ${rOuter} 0 0 1 ${
          cx - rOuter
        } ${cy} L ${cx - rExt * 0.7071} ${
          cy + rExt * 0.7071
        } A ${rExt} ${rExt} 0 0 0 ${cx + rExt * 0.7071} ${
          cy + rExt * 0.7071
        } L ${cx + rOuter} ${cy} A ${rOuter} ${rOuter} 0 0 1 ${cx} ${
          cy + rOuter
        } Z`;
      default:
        return "";
    }
  };

  // Render de un segmento
  const renderSegmento = (
    sector: number,
    index: number,
    segmento: number,
    valor: number, // May not be needed, but kept for clarity
    diente: Diente
  ) => {
    // const fullToothValue = Object.values(diente.segmentos).find(v => isFullToothValue(v)); // May not be needed, but kept for clarity
    const displayValue = diente.segmentos[segmento];

    let fillClass = "fill-white";
    let strokeColor = "stroke-gray-800";
    let strokeWidth = "";
    let fullToothMark = null;
    let outerCircle = null;

    switch (displayValue) {
      case 0: // Sin revisar
        fillClass = "fill-white";
        break;
      case 1: // Caries
        fillClass = "fill-red-500";
        break;
      case 2: // Restauración
        fillClass = "fill-blue-600";
        break;
      case 3: // Restauración defectuosa
        fillClass = "fill-blue-600";
        strokeColor = "stroke-red-600";
        strokeWidth = "stroke-2";
        break;
      case 4: // Exodoncia realizada
        if (segmento) {
          fullToothMark = (
            <text 
              x="25" 
              y="30" 
              dominantBaseline="middle" 
              textAnchor="middle" 
              className="text-[3rem] font-bold fill-blue-600 pointer-events-none"
            >
              X
            </text>
          );
        }
        break;
      case 5: // Exodoncia indicada
        if (segmento) {
          fullToothMark = (
            <text 
              x="25" 
              y="30" 
              dominantBaseline="middle" 
              textAnchor="middle" 
              className="text-[3rem] font-semibold fill-red-500 pointer-events-none"
            >
              X
            </text>
          );
        }
        break;
      case 6: // Endodoncia realizada
        if (segmento) {
          fullToothMark = (
            <text 
              x="25" 
              y="29" 
              dominantBaseline="middle" 
              textAnchor="middle" 
              className="text-[2.5rem] font-semibold fill-blue-600 pointer-events-none"
            >
              |
            </text>
          );
        }
        break;
      case 7: // Endodoncia indicada
          if (segmento) {
          fullToothMark = (
            <text 
              x="25" 
              y="29" 
              dominantBaseline="middle" 
              textAnchor="middle" 
              className="text-[2.5rem] font-bold fill-red-500 pointer-events-none"
            >
              |
            </text>
          );
        }
        break;
      case 8: // Corona/Prótesis fija
        fillClass = "fill-blue-400";
        break;
      case 9: // Corona/Prótesis indicada
        fillClass = "fill-red-300";
        break;
      case 10: // Diente en erupción
        if (segmento === 1) {
          outerCircle = (
            <circle 
              cx="25" 
              cy="25" 
              r="25" 
              className="stroke-blue-500 stroke-2 fill-none pointer-events-none"
            />
          );
        }
        break;
      case 11: // Erupción con inflamación
        if (segmento === 1) {
          outerCircle = (
            <circle 
              cx="25" 
              cy="25" 
              r="25" 
              className="stroke-red-500 stroke-2 fill-none pointer-events-none"
            />
          );
        }
        break;
      case 12: // Diente sano
        if (segmento) {
          fullToothMark = (
            <text 
              x="25" 
              y="30" 
              dominantBaseline="middle" 
              textAnchor="middle" 
              className="text-[3rem] font-semibold fill-blue-600 pointer-events-none"
            >
              S
            </text>
          );
        }
        break;
      case 13: // Diente ausente
        if (segmento) {
          fullToothMark = (
            <text 
              x="25" 
              y="29" 
              dominantBaseline="middle" 
              textAnchor="middle" 
              className="text-[3rem] font-semibold fill-black pointer-events-none"
            >
              A
            </text>
          );
        }
        break;
      case 14: // Diente fracturado
        if (segmento) {
          fullToothMark = (
            <svg width="42" height="45" viewBox="0 0 25 45" className="">
              <polyline
                points="28,4 5,8 28,16 5,24 28,32 5,40 28,44"
                strokeWidth="3"
                fill="none"
                className="stroke-red-500 pointer-events-none"
              />
            </svg>
          );
        }
        break;
    }

    return (
      <Fragment>
        <path
          key={`path-${sector}-${index}-${segmento}`}
          className={`${strokeColor} ${strokeWidth} ${fillClass} cursor-pointer hover:opacity-80`}
          d={getSegmentPath(segmento)}
          onClick={() => cambiarSegmento(sector, index, segmento)}
        />
        {outerCircle}
        {fullToothMark}
      </Fragment>
    );
  };

  // Render de un diente completo
  const renderDiente = (sector: number, diente: Diente, index: number) => {
  // Key que cambia con cualquier modificación
  const toothKey = `${sector}-${index}-${Object.values(diente.segmentos).join("-")}`;

  return (
    <div key={`tooth-${toothKey}`} className="relative">
      <div className="text-center text-xs mb-1 font-medium text-gray-700">
        {`${sector}${index + 1}`} {/* Muestra "sector-diente" */}
      </div>
      <svg 
        width="60" 
        height="60" 
        viewBox="0 0 60 60"
        // Key única para el SVG basada en los valores actuales
        key={`svg-${toothKey}`}
      >
        <g transform="translate(5, 5)">
          <circle cx="25" cy="25" r="24" className="stroke-gray-300 fill-none stroke-[0.5]" />
          {[1, 2, 3, 4, 5].map((segmento) => (
            <Fragment key={`segment-${toothKey}-${segmento}`}>
              {renderSegmento(
                sector,
                index,
                segmento,
                diente.segmentos[segmento],
                diente
              )}
            </Fragment>
          ))}
        </g>
      </svg>
        {!readOnly && (
          <button
            type="button"
            className="w-3 h-3 absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
            onClick={() => eliminarDiente(sector, index)}
          >
            ×
          </button>

        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {!readOnly && (
        <div className="mb-6 p-8 bg-white rounded-lg border border-gray-300">
          <div className="grid grid-cols-5 gap-3">
            {[
              { 
                v: 0, 
                title: "Sin revisar", 
                bg: "bg-white", 
                border: "border-gray-300" },
              { 
                v: 1, 
                title: "Caries", 
                bg: "bg-red-500", 
                border: "border-red-600" },
              { 
                v: 2, 
                title: "Restauración", 
                bg: "bg-blue-600", 
                border: "border-blue-700" },
              { 
                v: 3, 
                title: "Rest. Defectuosa", 
                bg: "bg-blue-600", 
                border: "border-red-600"
              },
              { 
                v: 4, 
                title: "Exodoncia Realizada", 
                bg: "bg-blue-600", 
                border: "border-blue-700",
                text: "X"
              },
              { 
                v: 5, 
                title: "Exodoncia Indicada", 
                bg: "bg-red-500", 
                border: "border-red-600",
                text: "X"
              },
              { 
                v: 6, 
                title: "Endodoncia Realizada", 
                bg: "bg-blue-600", 
                border: "border-blue-700",
                text: "|"
              },
              { 
                v: 7, 
                title: "Endodoncia Indicada", 
                bg: "bg-red-500", 
                border: "border-red-600",
                text: "|"
              },
              { 
                v: 8, 
                title: "Corona/Prótesis Fija", 
                bg: "bg-blue-400", 
                border: "border-blue-500"
              },
              { 
                v: 9, 
                title: "Corona/Prótesis Indicada", 
                bg: "bg-red-300", 
                border: "border-red-400"
              },
              { 
                v: 10, 
                title: "Diente en Erupción", 
                bg: "bg-white", 
                border: "border-blue-500 border-2"
              },
              { 
                v: 11, 
                title: "Erupción con Inflamación", 
                bg: "bg-white", 
                border: "border-red-500 border-2"
              },
              { 
                v: 12, 
                title: "Diente Sano", 
                bg: "bg-white", 
                border: "border-gray-300",
                text: "S",
                textColor: "text-blue-600"
              },
              { 
                v: 13, 
                title: "Diente Ausente", 
                bg: "bg-white", 
                border: "border-gray-300",
                text: "A",
                textColor: "text-black"
              },
              { 
                v: 14, 
                title: "Diente Fracturado", 
                bg: "bg-white", 
                border: "border-gray-300",
                svg: (
                  <svg width="24" height="40" viewBox="0 0 24 40" className="w-4 h-6">
                    <polyline
                      points="25,1 0,4 25,12 0,20 25,28 0,36 25,39"
                      stroke="red"
                      strokeWidth="3"
                      fill="none"
                    />
                  </svg>
                )
              },
            ].map(({ v, title, bg, border, text, svg, textColor = "text-white" }) => (
              <div key={v} className="flex flex-col items-center">
                <button
                  type="button"
                  className={`relative w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden transition-all
                    ${valorSeleccionado === v ? "ring-2 ring-offset-2 ring-blue-500" : ""}
                    ${bg} ${border}`}
                  onClick={() => setValorSeleccionado(v)}
                  title={title}
                >
                  {text && (
                    <span className={`text-lg font-bold ${textColor}`}>{text}</span>
                  )}

                  {svg && (
                    <span className="w-full h-full flex items-center justify-center">{svg}</span>
                  )}
                </button>
                <span className="text-xs text-center mt-1 text-gray-600">{title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="border border-gray-300 bg-white rounded-lg p-4">
        {/* Cuadrante Superior */}
        <div className="flex border-b border-dashed border-gray-300">
          {/* Cuadrante Superior Izquierdo */}
          <div className="w-1/2 border-r border-dashed border-gray-300 py-5 px-8">
            <div className="flex justify-start items-center mb-2">
              {!readOnly && (
                <Button
                  className="w-8 h-8 text-md rounded-full border border-gray-300 mb-4 hover:bg-gray-500 hover:text-white flex items-center justify-center"
                  onClick={() => agregarDiente(1)}
                >
                  +
                </Button>
              )}
            </div>
            <div className="flex flex-row-reverse flex-wrap gap-2 justify-start">
              {sectores[1].dientes.map((d, idx) => 
                renderDiente(1, d, idx)
              )}
            </div>
            
            <div className="mt-8">
              <div className="flex justify-between items-center mb-2">
                {!readOnly && (
                  <Button
                    className="w-8 h-8 text-md rounded-full border border-gray-300 mb-4 hover:bg-gray-500 hover:text-white flex items-center justify-center"
                    onClick={() => agregarDiente(5)}
                  >
                    +
                  </Button>
                )}
              </div>
              <div className="flex flex-row-reverse flex-wrap gap-2 justify-start">
                {sectores[5].dientes.map((d, idx) => 
                  renderDiente(5, d, idx)
                )}
              </div>
            </div>
          </div>

          {/* Cuadrante Superior Derecho */}
          <div className="w-1/2 border-l border-dashed border-gray-300 py-5 px-8">
            <div className="flex justify-end items-center mb-2">
              {!readOnly && (
                <Button
                  className="w-8 h-8 text-md rounded-full border border-gray-300 mb-4 hover:bg-gray-500 hover:text-white flex items-center justify-center"
                  onClick={() => agregarDiente(2)}
                >
                  +
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-start">
              {sectores[2].dientes.map((d, idx) => 
                renderDiente(2, d, idx)
              )}
            </div>
            
            <div className="mt-8">
              <div className="flex justify-end items-center mb-2">
                {!readOnly && (
                  <Button
                    className="w-8 h-8 text-md rounded-full border border-gray-300 mb-4 hover:bg-gray-500 hover:text-white flex items-center justify-center"
                    onClick={() => agregarDiente(6)}
                  >
                    +
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-start">
                {sectores[6].dientes.map((d, idx) => 
                  renderDiente(6, d, idx)
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Cuadrante Inferior */}
        <div className="flex border-t border-dashed border-gray-300">
          {/* Cuadrante Inferior Izquierdo */}
          <div className="w-1/2 border-r border-dashed border-gray-300 py-5 px-8">
            <div className="flex justify-start items-center mb-2">
              {!readOnly && (
                <Button
                  className="w-8 h-8 text-md rounded-full border border-gray-300 mb-4 hover:bg-gray-500 hover:text-white flex items-center justify-center"
                  onClick={() => agregarDiente(8)}
                >
                  +
                </Button>
              )}
            </div>
            <div className="flex flex-row-reverse flex-wrap gap-2 justify-start">
              {sectores[8].dientes.map((d, idx) => 
                renderDiente(8, d, idx)
              )}
            </div>
            
            <div className="mt-8">
              <div className="flex justify-start items-center mb-2">
                {!readOnly && (
                  <Button
                    className="w-8 h-8 text-md rounded-full border border-gray-300 mb-4 hover:bg-gray-500 hover:text-white flex items-center justify-center"
                    onClick={() => agregarDiente(4)}
                  >
                    +
                  </Button>
                )}
              </div>
              <div className="flex flex-row-reverse flex-wrap gap-2 justify-start">
                {sectores[4].dientes.map((d, idx) => 
                  renderDiente(4, d, idx)
                )}
              </div>
            </div>
          </div>

          {/* Cuadrante Inferior Derecho */}
          <div className="w-1/2 border-l border-dashed border-gray-300 py-5 px-8">
            <div className="flex justify-end items-center mb-2">
              {!readOnly && (
                <Button
                  className="w-8 h-8 text-md rounded-full border border-gray-300 mb-4 hover:bg-gray-500 hover:text-white flex items-center justify-center"
                  onClick={() => agregarDiente(7)}
                >
                  +
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 justify-start">
              {sectores[7].dientes.map((d, idx) => 
                renderDiente(7, d, idx)
              )}
            </div>
            
            <div className="mt-8">
              <div className="flex justify-end items-center mb-2">
                {!readOnly && (
                  <div className="flex items-center">
                  <Button
                    className="w-8 h-8 text-md rounded-full border border-gray-300 mb-4 hover:bg-gray-500 hover:text-white flex items-center justify-center"
                    onClick={() => agregarDiente(3)}
                  >
                    +
                  </Button>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 justify-start">
                {sectores[3].dientes.map((d, idx) => 
                  renderDiente(3, d, idx)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

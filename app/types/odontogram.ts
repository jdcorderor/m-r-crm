// Define segment type
export type Segmentos = Record<number, number>;

// Define tooth type
export type Diente = {
  segmentos: Segmentos;
}

// Define sector type
export type SectorData = {
  dientes: Diente[];
}

// Define odontogram type
export type OdontogramProps = {
  onChange: (data: Record<number, SectorData>) => void;
  readOnly?: boolean;
  initialData?: Record<
    number,
    { dientes: Record<number, { segmentos: Record<number, number> }> }
  >;
}
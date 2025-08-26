type ArrowProps = {
    onClick?: () => void;
};

const NextArrow: React.FC<ArrowProps> = ({ onClick }) => (
    <div className="cursor-pointer hover:scale-115 transition-transform" onClick={onClick}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M8 5l8 7-8 7" stroke="gray" strokeWidth="2" />
        </svg>
    </div>
);

const PrevArrow: React.FC<ArrowProps> = ({ onClick }) => (
    <div className="cursor-pointer hover:scale-115 transition-transform" onClick={onClick}>
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
            <path d="M16 5l-8 7 8 7" stroke="gray" strokeWidth="2" />
        </svg>
    </div>
);

export { NextArrow, PrevArrow };
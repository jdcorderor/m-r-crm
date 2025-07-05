const Input = ({ ...props }) => (
    <input
        {...props}
        className={`w-full px-3 py-2 bg-white text-gray-500 outline-none border shadow-sm rounded-lg duration-150 mb-2 ${props.className || ""}`}
    />
)

export default Input
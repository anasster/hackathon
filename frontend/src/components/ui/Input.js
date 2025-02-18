// src/components/ui/Input.js
const Input = ({ className, ...props }) => {
    return (
      <input
        className={`p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
        {...props}
      />
    );
  };
  
  export default Input;
  
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const CustomDropdown = ({
  onSelect,
  sets,
  setCurrentSet,
  mobileDimension,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(localStorage.getItem("currentSet") ? JSON.parse(localStorage.getItem("currentSet")).title : "Choose");

  const dropdownRef = useRef(null);
  const toggleDropdown = () => setIsOpen((prevState) => !prevState);

  const handleOptionClick = (option) => {
    setSelectedOption(option.title);
    setIsOpen(false);
    setCurrentSet(option)
    localStorage.setItem("currentSet", JSON.stringify(option))
    if (onSelect) onSelect(option.title);
  };

  const handleClickOutside = (event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };
  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-block",
        padding: "10px 0px",
      }}
      ref={dropdownRef}
    >
      <div
        style={{
          padding: "5px 10px",
          backgroundColor: "black",
          border: "1px solid #ccc",
          borderRadius: "4px",
          cursor: "pointer",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: mobileDimension ? "10px" : "14px",
          borderRadius: "100px",
          width: mobileDimension && "70px",
        }}
        onClick={toggleDropdown}
      >
        {mobileDimension
          ? selectedOption.slice(0, 12) ||
            (sets && sets[0] && sets[0].title.slice(0, 12))
          : selectedOption || (sets && sets[0] && sets[0].title.slice)}
      </div>
      {isOpen && (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            right: "0px",
            backgroundColor: "#6A6CFF",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
            zIndex: "1000",
            width: "300px",
          }}
        >
          {sets &&
            sets.map((option, index) => (
              <div
                key={index}
                style={{
                  padding: "10px",
                  cursor: "pointer",
                  fontSize: mobileDimension ? "10px" : "14px",
                  backgroundColor: "transparent",
                  display: "flex",
                }}
                onClick={() => handleOptionClick(option)}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#484AC3")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                {option.title}
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
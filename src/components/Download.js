import { useState, useRef, useEffect } from "react";
import { jsPDF } from 'jspdf';
import LoadingIndicator from './loading_indicator';
import html2canvas from 'html2canvas';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';


pdfMake.vfs = pdfFonts.pdfMake.vfs;

const Download = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(localStorage.getItem("currentSet") ? JSON.parse(localStorage.getItem("currentSet")).title : "Pick A Subject");
    const dropdownRef = useRef(null);
    const [loading, setLoading] = useState(false);

    const toggleDropdown = () => setIsOpen(prevState => !prevState);

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    const handleDownloadPdf = () => {
        setLoading(true);
    
        const lastSet = JSON.parse(localStorage.getItem('lastSet'));
    
        if (!lastSet || !Array.isArray(lastSet) || lastSet.length === 0) {
          console.error('No data available in lastSet');
          setLoading(false);
          return;
        }
    
        const content = lastSet.map((item, index) => {
          const choices = item.choices ? item.choices.map((choice, choiceIndex) => ({
            text: `Choice ${choiceIndex + 1}: ${choice}`,
            margin: [0, 5],
            fontSize: 10
          })) : [];
    
          return [
            { text: `Q${index + 1}: ${item.question}`, margin: [0, 10], fontSize: 12 },
            ...choices,
            { text: `Answer: ${item.answer}`, margin: [0, 10], fontSize: 10, bold: true }
          ];
        });
    
        const docDefinition = {
          content: content.flat(),
          defaultStyle: {
          }
        };
    
        pdfMake.createPdf(docDefinition).download(lastSet[0].title);
        setLoading(false);
      };
    
      
    return (
        <div
            style={{
                position: 'relative',
                display: 'inline-block',
                padding: "10px 0px"
            }}
            ref={dropdownRef}
        >
            {loading && <LoadingIndicator />}
            <div
                style={{
                    padding: '5px 10px',
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '14px',
                    borderRadius: "100px",
                    width:"100%"
                }}
                onClick={handleDownloadPdf}
            >
                Download Last Set
            </div>
        </div>
    );
};

export default Download;

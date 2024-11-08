import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import PDFJSWorker from 'pdfjs-dist/legacy/build/pdf.worker.entry';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJSWorker;

function FileUpload() {
    const [text, setText] = useState('');
    const [pdfUrl, setPdfUrl] = useState(null);

    // Handler for file upload
    function handleFile(event) {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            // Create a URL for the uploaded PDF file
            const fileUrl = URL.createObjectURL(file);
            setPdfUrl(fileUrl);
            extractTextFromPdf(file);
        } else {
            alert('Please upload a valid PDF file.');
        }
    }

    // Extract text from the PDF
    function extractTextFromPdf(file) {
        const fileReader = new FileReader();

        fileReader.onload = async function () {
            const typedarray = new Uint8Array(this.result);

            try {
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                const numPages = pdf.numPages;
                let fullText = '';

                // Function to extract text from each page
                const extractTextFromPage = async (pageNum) => {
                    const page = await pdf.getPage(pageNum);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map(item => item.str).join(' ');
                    fullText += pageText + '\n';

                    if (pageNum < numPages) {
                        extractTextFromPage(pageNum + 1);
                    } else {
                        setText(fullText);
                    }
                };

                extractTextFromPage(1);
            } catch (error) {
                console.error('Error loading PDF document:', error);
            }
        };

        fileReader.readAsArrayBuffer(file);
    }

    return (
        <div>
            <form>
                <input type="file" name="file" accept=".pdf" onChange={handleFile} />
            </form>
        </div>
    );
}

export default FileUpload;

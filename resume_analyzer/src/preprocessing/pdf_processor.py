import logging
from typing import Dict, List, Optional, Tuple
import pdfjs
from pdfjs import PDFDocument
import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import numpy as np
from pathlib import Path
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFProcessor:
    def __init__(self, tesseract_path: Optional[str] = None):
        """
        Initialize PDF processor with optional Tesseract OCR path.
        
        Args:
            tesseract_path: Path to Tesseract OCR executable
        """
        if tesseract_path:
            pytesseract.pytesseract.tesseract_cmd = tesseract_path
            
        # Initialize PDF.js
        pdfjs.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/build/pdf.worker.js'
        
        # Common resume section headers
        self.section_headers = {
            'contact': ['contact', 'contact information', 'email', 'phone', 'address'],
            'summary': ['summary', 'professional summary', 'objective', 'career objective'],
            'experience': ['experience', 'work experience', 'employment history', 'professional experience'],
            'education': ['education', 'academic background', 'qualifications'],
            'skills': ['skills', 'technical skills', 'core competencies', 'expertise'],
            'projects': ['projects', 'personal projects', 'portfolio']
        }

    def extract_text_with_pdfjs(self, pdf_path: str) -> Tuple[str, Dict]:
        """
        Extract text using PDF.js with formatting preservation.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Tuple of (extracted text, formatting information)
        """
        try:
            # Load PDF document
            doc = PDFDocument(pdf_path)
            text_content = []
            formatting_info = {
                'fonts': [],
                'sizes': [],
                'positions': []
            }
            
            # Process each page
            for page_num in range(len(doc.pages)):
                page = doc.pages[page_num]
                
                # Extract text with formatting
                text_items = page.get_text_content()
                for item in text_items:
                    text_content.append(item['str'])
                    formatting_info['fonts'].append(item.get('fontName', ''))
                    formatting_info['sizes'].append(item.get('fontSize', 0))
                    formatting_info['positions'].append(item.get('transform', []))
            
            return '\n'.join(text_content), formatting_info
            
        except Exception as e:
            logger.error(f"Error extracting text with PDF.js from {pdf_path}: {str(e)}")
            raise

    def extract_text_with_ocr(self, pdf_path: str) -> str:
        """
        Extract text from scanned PDFs using OCR.
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Extracted text
        """
        try:
            # Convert PDF to images
            images = convert_from_path(pdf_path)
            text_content = []
            
            # Process each page
            for image in images:
                # Preprocess image for better OCR
                processed_image = self._preprocess_image(image)
                
                # Perform OCR
                text = pytesseract.image_to_string(processed_image)
                text_content.append(text)
            
            return '\n'.join(text_content)
            
        except Exception as e:
            logger.error(f"Error performing OCR on {pdf_path}: {str(e)}")
            raise

    def _preprocess_image(self, image: Image.Image) -> Image.Image:
        """
        Preprocess image for better OCR results.
        
        Args:
            image: PIL Image object
            
        Returns:
            Preprocessed image
        """
        # Convert to grayscale
        gray_image = image.convert('L')
        
        # Apply thresholding
        threshold = 128
        binary_image = gray_image.point(lambda x: 0 if x < threshold else 255, '1')
        
        return binary_image

    def identify_sections(self, text: str) -> Dict[str, str]:
        """
        Identify different sections in the resume text.
        
        Args:
            text: Extracted text from PDF
            
        Returns:
            Dictionary mapping section names to their content
        """
        sections = {}
        lines = text.split('\n')
        current_section = None
        current_content = []

        for line in lines:
            line = line.strip().lower()
            if not line:
                continue

            # Check if line is a section header
            for section, headers in self.section_headers.items():
                if any(header in line for header in headers):
                    if current_section and current_content:
                        sections[current_section] = '\n'.join(current_content)
                    current_section = section
                    current_content = []
                    break
            else:
                if current_section:
                    current_content.append(line)

        # Add the last section
        if current_section and current_content:
            sections[current_section] = '\n'.join(current_content)

        return sections

    def extract_contact_info(self, contact_text: str) -> Dict[str, str]:
        """
        Extract contact information from contact section.
        
        Args:
            contact_text: Text from contact section
            
        Returns:
            Dictionary with contact information
        """
        contact_info = {
            'email': '',
            'phone': '',
            'location': '',
            'linkedin': ''
        }

        lines = contact_text.split('\n')
        for line in lines:
            line = line.lower()
            if '@' in line:
                contact_info['email'] = line.strip()
            elif any(char.isdigit() for char in line):
                contact_info['phone'] = line.strip()
            elif 'linkedin.com' in line:
                contact_info['linkedin'] = line.strip()
            else:
                contact_info['location'] = line.strip()

        return contact_info

    def process_pdf(self, pdf_path: str, use_ocr: bool = False) -> Dict:
        """
        Process PDF file and extract structured information.
        
        Args:
            pdf_path: Path to PDF file
            use_ocr: Whether to use OCR for scanned PDFs
            
        Returns:
            Dictionary containing structured resume information
        """
        try:
            # Extract text with appropriate method
            if use_ocr:
                text, formatting_info = self.extract_text_with_ocr(pdf_path), {}
            else:
                text, formatting_info = self.extract_text_with_pdfjs(pdf_path)
            
            # Identify sections
            sections = self.identify_sections(text)
            
            # Extract contact information
            contact_info = self.extract_contact_info(sections.get('contact', ''))
            
            return {
                'raw_text': text,
                'sections': sections,
                'contact_info': contact_info,
                'formatting_info': formatting_info,
                'metadata': {
                    'filename': Path(pdf_path).name,
                    'file_size': Path(pdf_path).stat().st_size,
                    'page_count': len(text.split('\n\n')),
                    'processing_method': 'ocr' if use_ocr else 'pdfjs'
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing PDF {pdf_path}: {str(e)}")
            raise 
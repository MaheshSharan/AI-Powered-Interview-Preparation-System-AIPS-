import logging
from typing import Dict, List, Optional, Tuple
import re
import unicodedata
from bs4 import BeautifulSoup
import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer, PorterStemmer
from pathlib import Path
import json

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    nltk.download('punkt')
    nltk.download('stopwords')
    nltk.download('wordnet')

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TextCleaner:
    def __init__(self):
        """Initialize text cleaner with NLTK components."""
        self.lemmatizer = WordNetLemmatizer()
        self.stemmer = PorterStemmer()
        self.stop_words = set(stopwords.words('english'))
        
        # Add custom stop words for resumes
        self.stop_words.update([
            'experience', 'skills', 'education', 'work', 'project',
            'developed', 'implemented', 'created', 'designed', 'managed',
            'led', 'improved', 'increased', 'reduced', 'achieved'
        ])
        
        # Common abbreviations in resumes
        self.abbreviations = {
            'bsc': 'Bachelor of Science',
            'msc': 'Master of Science',
            'phd': 'Doctor of Philosophy',
            'mba': 'Master of Business Administration',
            'btech': 'Bachelor of Technology',
            'mtech': 'Master of Technology',
            'bca': 'Bachelor of Computer Applications',
            'mca': 'Master of Computer Applications'
        }

    def clean_text(self, text: str) -> str:
        """
        Clean and normalize text.
        
        Args:
            text: Input text to clean
            
        Returns:
            Cleaned text
        """
        try:
            # Convert to lowercase
            text = text.lower()
            
            # Remove HTML tags
            text = BeautifulSoup(text, 'html.parser').get_text()
            
            # Remove special characters and numbers
            text = re.sub(r'[^a-zA-Z\s]', ' ', text)
            
            # Remove extra whitespace
            text = re.sub(r'\s+', ' ', text)
            
            # Normalize unicode characters
            text = unicodedata.normalize('NFKD', text).encode('ASCII', 'ignore').decode('utf-8')
            
            return text.strip()
            
        except Exception as e:
            logger.error(f"Error cleaning text: {str(e)}")
            raise

    def tokenize(self, text: str) -> List[str]:
        """
        Tokenize text into words.
        
        Args:
            text: Input text to tokenize
            
        Returns:
            List of tokens
        """
        try:
            return word_tokenize(text)
        except Exception as e:
            logger.error(f"Error tokenizing text: {str(e)}")
            raise

    def remove_stopwords(self, tokens: List[str]) -> List[str]:
        """
        Remove stop words from tokens.
        
        Args:
            tokens: List of tokens
            
        Returns:
            List of tokens without stop words
        """
        try:
            return [token for token in tokens if token not in self.stop_words]
        except Exception as e:
            logger.error(f"Error removing stopwords: {str(e)}")
            raise

    def lemmatize(self, tokens: List[str]) -> List[str]:
        """
        Lemmatize tokens.
        
        Args:
            tokens: List of tokens
            
        Returns:
            List of lemmatized tokens
        """
        try:
            return [self.lemmatizer.lemmatize(token) for token in tokens]
        except Exception as e:
            logger.error(f"Error lemmatizing tokens: {str(e)}")
            raise

    def stem(self, tokens: List[str]) -> List[str]:
        """
        Stem tokens.
        
        Args:
            tokens: List of tokens
            
        Returns:
            List of stemmed tokens
        """
        try:
            return [self.stemmer.stem(token) for token in tokens]
        except Exception as e:
            logger.error(f"Error stemming tokens: {str(e)}")
            raise

    def expand_abbreviations(self, text: str) -> str:
        """
        Expand common abbreviations in resume text.
        
        Args:
            text: Input text with abbreviations
            
        Returns:
            Text with expanded abbreviations
        """
        try:
            words = text.split()
            expanded_words = []
            
            for word in words:
                if word in self.abbreviations:
                    expanded_words.append(self.abbreviations[word])
                else:
                    expanded_words.append(word)
                    
            return ' '.join(expanded_words)
            
        except Exception as e:
            logger.error(f"Error expanding abbreviations: {str(e)}")
            raise

    def clean_section(self, section_text: str) -> Dict[str, str]:
        """
        Clean a specific resume section.
        
        Args:
            section_text: Text from a resume section
            
        Returns:
            Dictionary containing cleaned text and tokens
        """
        try:
            # Clean text
            cleaned_text = self.clean_text(section_text)
            
            # Expand abbreviations
            expanded_text = self.expand_abbreviations(cleaned_text)
            
            # Tokenize
            tokens = self.tokenize(expanded_text)
            
            # Remove stopwords
            tokens_no_stop = self.remove_stopwords(tokens)
            
            # Lemmatize
            lemmatized_tokens = self.lemmatize(tokens_no_stop)
            
            # Stem
            stemmed_tokens = self.stem(lemmatized_tokens)
            
            return {
                'original_text': section_text,
                'cleaned_text': cleaned_text,
                'expanded_text': expanded_text,
                'tokens': tokens,
                'tokens_no_stop': tokens_no_stop,
                'lemmatized_tokens': lemmatized_tokens,
                'stemmed_tokens': stemmed_tokens
            }
            
        except Exception as e:
            logger.error(f"Error cleaning section: {str(e)}")
            raise

    def clean_resume(self, resume_data: Dict) -> Dict:
        """
        Clean all sections of a resume.
        
        Args:
            resume_data: Dictionary containing resume sections
            
        Returns:
            Dictionary containing cleaned resume data
        """
        try:
            cleaned_resume = {
                'raw_text': resume_data.get('raw_text', ''),
                'sections': {},
                'metadata': resume_data.get('metadata', {})
            }
            
            # Clean each section
            for section_name, section_text in resume_data.get('sections', {}).items():
                cleaned_resume['sections'][section_name] = self.clean_section(section_text)
            
            return cleaned_resume
            
        except Exception as e:
            logger.error(f"Error cleaning resume: {str(e)}")
            raise 
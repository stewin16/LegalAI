"""
Legal-Aware Document Chunking Module

Implements semantic chunking strategy that respects legal document structure:
- Section boundary detection
- Hierarchy preservation (Section → Subsection → Clause)
- Optimal chunk sizing (500-800 tokens)
- Context overlap for continuity
"""

import re
from typing import List, Dict, Optional, Tuple
from dataclasses import dataclass


@dataclass
class LegalChunk:
    """Represents a semantically coherent chunk of legal text"""
    text: str
    section_number: Optional[str] = None
    parent_section: Optional[str] = None
    chunk_type: str = "general"  # "statute" | "judgment" | "commentary" | "general"
    start_char: int = 0
    end_char: int = 0
    metadata: Dict = None
    
    def __post_init__(self):
        if self.metadata is None:
            self.metadata = {}


class LegalChunker:
    """
    Chunks legal documents at semantic boundaries while preserving structure
    """
    
    def __init__(
        self,
        target_chunk_size: int = 600,  # tokens
        min_chunk_size: int = 400,
        max_chunk_size: int = 900,
        overlap_tokens: int = 50
    ):
        """
        Initialize legal chunker
        
        Args:
            target_chunk_size: Target tokens per chunk
            min_chunk_size: Minimum tokens per chunk
            max_chunk_size: Maximum tokens per chunk
            overlap_tokens: Tokens to overlap between chunks
        """
        self.target_chunk_size = target_chunk_size
        self.min_chunk_size = min_chunk_size
        self.max_chunk_size = max_chunk_size
        self.overlap_tokens = overlap_tokens
        
        # Approximate: 1 token ≈ 4 characters for English legal text
        self.chars_per_token = 4
        
        # Section patterns for Indian legal documents
        self.section_patterns = [
            # IPC/BNS style: "Section 302", "Section 123A"
            r'(?:^|\n)\s*Section\s+(\d+[A-Z]?)\s*[.:\-]',
            # Article style: "Article 21", "Article 14A"
            r'(?:^|\n)\s*Article\s+(\d+[A-Z]?)\s*[.:\-]',
            # Clause style: "Clause 5", "Clause (a)"
            r'(?:^|\n)\s*Clause\s+(\d+|\([a-z]\))\s*[.:\-]',
            # Subsection: "(1)", "(2)", "(a)", "(b)"
            r'(?:^|\n)\s*\((\d+|[a-z])\)\s+',
            # Chapter/Part: "Chapter III", "Part IV"
            r'(?:^|\n)\s*(Chapter|Part)\s+([IVX]+|\d+)\s*[.:\-]'
        ]
        
        # Compile patterns
        self.compiled_patterns = [re.compile(p, re.MULTILINE | re.IGNORECASE) for p in self.section_patterns]
    
    def _estimate_tokens(self, text: str) -> int:
        """Estimate token count from character count"""
        return len(text) // self.chars_per_token
    
    def _detect_section_boundaries(self, text: str) -> List[Tuple[int, str, str]]:
        """
        Detect section boundaries in text
        
        Returns:
            List of (position, section_type, section_number) tuples
        """
        boundaries = []
        
        for pattern in self.compiled_patterns:
            for match in pattern.finditer(text):
                pos = match.start()
                section_type = "section"
                
                # Extract section number
                if "Chapter" in match.group(0) or "Part" in match.group(0):
                    section_type = "chapter"
                    section_number = match.group(2) if match.lastindex >= 2 else match.group(1)
                else:
                    section_number = match.group(1)
                
                boundaries.append((pos, section_type, section_number))
        
        # Sort by position
        boundaries.sort(key=lambda x: x[0])
        
        return boundaries
    
    def _split_at_boundaries(
        self,
        text: str,
        boundaries: List[Tuple[int, str, str]]
    ) -> List[Dict]:
        """
        Split text at detected boundaries
        
        Returns:
            List of segment dicts with text and metadata
        """
        if not boundaries:
            return [{"text": text, "section": None, "type": "general"}]
        
        segments = []
        
        for i, (pos, sec_type, sec_num) in enumerate(boundaries):
            # Determine end position
            if i < len(boundaries) - 1:
                end_pos = boundaries[i + 1][0]
            else:
                end_pos = len(text)
            
            segment_text = text[pos:end_pos].strip()
            
            if segment_text:
                segments.append({
                    "text": segment_text,
                    "section": sec_num,
                    "type": sec_type,
                    "start": pos,
                    "end": end_pos
                })
        
        # Add any text before first boundary
        if boundaries[0][0] > 0:
            preamble = text[:boundaries[0][0]].strip()
            if preamble:
                segments.insert(0, {
                    "text": preamble,
                    "section": None,
                    "type": "preamble",
                    "start": 0,
                    "end": boundaries[0][0]
                })
        
        return segments
    
    def _merge_small_segments(self, segments: List[Dict]) -> List[Dict]:
        """
        Merge segments that are too small
        
        Args:
            segments: List of segment dicts
            
        Returns:
            Merged segments
        """
        if not segments:
            return []
        
        merged = []
        current = segments[0].copy()
        
        for next_seg in segments[1:]:
            current_tokens = self._estimate_tokens(current["text"])
            next_tokens = self._estimate_tokens(next_seg["text"])
            
            # Merge if current is too small and combined is not too large
            if current_tokens < self.min_chunk_size and (current_tokens + next_tokens) <= self.max_chunk_size:
                current["text"] += "\n\n" + next_seg["text"]
                current["end"] = next_seg["end"]
                # Keep first section number
            else:
                merged.append(current)
                current = next_seg.copy()
        
        merged.append(current)
        return merged
    
    def _split_large_segments(self, segments: List[Dict]) -> List[Dict]:
        """
        Split segments that are too large
        
        Args:
            segments: List of segment dicts
            
        Returns:
            Split segments
        """
        result = []
        
        for seg in segments:
            tokens = self._estimate_tokens(seg["text"])
            
            if tokens <= self.max_chunk_size:
                result.append(seg)
            else:
                # Split by sentences
                sentences = re.split(r'(?<=[.!?])\s+', seg["text"])
                
                current_chunk = ""
                current_start = seg["start"]
                
                for sentence in sentences:
                    test_chunk = current_chunk + " " + sentence if current_chunk else sentence
                    
                    if self._estimate_tokens(test_chunk) > self.target_chunk_size and current_chunk:
                        # Save current chunk
                        result.append({
                            "text": current_chunk.strip(),
                            "section": seg["section"],
                            "type": seg["type"],
                            "start": current_start,
                            "end": current_start + len(current_chunk)
                        })
                        current_chunk = sentence
                        current_start += len(current_chunk)
                    else:
                        current_chunk = test_chunk
                
                # Add remaining
                if current_chunk.strip():
                    result.append({
                        "text": current_chunk.strip(),
                        "section": seg["section"],
                        "type": seg["type"],
                        "start": current_start,
                        "end": seg["end"]
                    })
        
        return result
    
    def _add_overlap(self, chunks: List[LegalChunk]) -> List[LegalChunk]:
        """
        Add overlapping context between chunks
        
        Args:
            chunks: List of LegalChunk objects
            
        Returns:
            Chunks with overlap added
        """
        if len(chunks) <= 1:
            return chunks
        
        overlapped = []
        overlap_chars = self.overlap_tokens * self.chars_per_token
        
        for i, chunk in enumerate(chunks):
            text = chunk.text
            
            # Add suffix from previous chunk
            if i > 0:
                prev_text = chunks[i - 1].text
                overlap_prefix = prev_text[-overlap_chars:] if len(prev_text) > overlap_chars else prev_text
                # Find sentence boundary
                last_period = overlap_prefix.rfind('.')
                if last_period > 0:
                    overlap_prefix = overlap_prefix[last_period + 1:].strip()
                text = overlap_prefix + " " + text
            
            # Add prefix from next chunk
            if i < len(chunks) - 1:
                next_text = chunks[i + 1].text
                overlap_suffix = next_text[:overlap_chars] if len(next_text) > overlap_chars else next_text
                # Find sentence boundary
                first_period = overlap_suffix.find('.')
                if first_period > 0:
                    overlap_suffix = overlap_suffix[:first_period + 1].strip()
                text = text + " " + overlap_suffix
            
            overlapped.append(LegalChunk(
                text=text.strip(),
                section_number=chunk.section_number,
                parent_section=chunk.parent_section,
                chunk_type=chunk.chunk_type,
                start_char=chunk.start_char,
                end_char=chunk.end_char,
                metadata=chunk.metadata
            ))
        
        return overlapped
    
    def chunk_legal_document(
        self,
        text: str,
        metadata: Optional[Dict] = None,
        add_overlap: bool = True
    ) -> List[LegalChunk]:
        """
        Chunk a legal document with semantic awareness
        
        Args:
            text: Full document text
            metadata: Document metadata to attach to chunks
            add_overlap: Whether to add overlapping context
            
        Returns:
            List of LegalChunk objects
        """
        if not text or not text.strip():
            return []
        
        metadata = metadata or {}
        
        # 1. Detect section boundaries
        boundaries = self._detect_section_boundaries(text)
        
        # 2. Split at boundaries
        segments = self._split_at_boundaries(text, boundaries)
        
        # 3. Merge small segments
        segments = self._merge_small_segments(segments)
        
        # 4. Split large segments
        segments = self._split_large_segments(segments)
        
        # 5. Convert to LegalChunk objects
        chunks = []
        for seg in segments:
            chunk_metadata = metadata.copy()
            chunk_metadata.update({
                "section": seg.get("section"),
                "segment_type": seg.get("type")
            })
            
            # Determine chunk type from metadata
            chunk_type = "general"
            if metadata.get("type") == "statute":
                chunk_type = "statute"
            elif metadata.get("type") == "judgment":
                chunk_type = "judgment"
            
            chunks.append(LegalChunk(
                text=seg["text"],
                section_number=seg.get("section"),
                parent_section=None,  # TODO: Implement hierarchy detection
                chunk_type=chunk_type,
                start_char=seg.get("start", 0),
                end_char=seg.get("end", len(text)),
                metadata=chunk_metadata
            ))
        
        # 6. Add overlap if requested
        if add_overlap and len(chunks) > 1:
            chunks = self._add_overlap(chunks)
        
        return chunks
    
    def chunk_text_simple(self, text: str, metadata: Optional[Dict] = None) -> List[str]:
        """
        Simple chunking without legal structure awareness (fallback)
        
        Args:
            text: Text to chunk
            metadata: Optional metadata
            
        Returns:
            List of text chunks
        """
        chunks = self.chunk_legal_document(text, metadata, add_overlap=False)
        return [chunk.text for chunk in chunks]


# Convenience function
def chunk_legal_text(
    text: str,
    metadata: Optional[Dict] = None,
    target_size: int = 600
) -> List[LegalChunk]:
    """
    Convenience function to chunk legal text
    
    Args:
        text: Legal document text
        metadata: Document metadata
        target_size: Target chunk size in tokens
        
    Returns:
        List of LegalChunk objects
    """
    chunker = LegalChunker(target_chunk_size=target_size)
    return chunker.chunk_legal_document(text, metadata)

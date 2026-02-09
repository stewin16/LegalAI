"""
Ollama Client for Multi-Model RAG System

Manages lifecycle and API calls for 3 specialized models:
- Query Understanding (Mistral 7B)
- Grounded Generation (Llama3 8B)
- Verification Guard (Phi3 Mini)

Features:
- Health check on startup
- Model preloading into memory
- Automatic retry with exponential backoff
- Timeout handling
- Connection pooling
"""

import os
import time
import json
import asyncio
from typing import Dict, Optional, List
import aiohttp
from dataclasses import dataclass


@dataclass
class ModelConfig:
    """Configuration for each model role"""
    name: str
    role: str
    timeout: int = 30
    max_tokens: int = 2000
    temperature: float = 0.3


class OllamaClient:
    """
    Client for managing Ollama model lifecycle and API calls
    """
    
    def __init__(self, base_url: str = "http://localhost:11434"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        
        # Model configurations
        self.models = {
            "query_understanding": ModelConfig(
                name=os.getenv("OLLAMA_QUERY_MODEL", "mistral:7b-instruct"),
                role="query_understanding",
                timeout=20,
                max_tokens=500,
                temperature=0.2
            ),
            "generation": ModelConfig(
                name=os.getenv("OLLAMA_GENERATION_MODEL", "llama3:8b-instruct"),
                role="generation",
                timeout=30,
                max_tokens=2000,
                temperature=0.3
            ),
            "verification": ModelConfig(
                name=os.getenv("OLLAMA_VERIFICATION_MODEL", "phi3:mini"),
                role="verification",
                timeout=20,
                max_tokens=1000,
                temperature=0.1
            )
        }
        
        self._session: Optional[aiohttp.ClientSession] = None
        self._preloaded = False
        
    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session for connection pooling"""
        if self._session is None or self._session.closed:
            timeout = aiohttp.ClientTimeout(total=60)
            self._session = aiohttp.ClientSession(timeout=timeout)
        return self._session
    
    async def close(self):
        """Close the aiohttp session"""
        if self._session and not self._session.closed:
            await self._session.close()
    
    async def health_check(self) -> bool:
        """
        Check if Ollama server is running and accessible
        
        Returns:
            bool: True if healthy, False otherwise
        """
        try:
            session = await self._get_session()
            async with session.get(f"{self.base_url}/api/tags", timeout=aiohttp.ClientTimeout(total=5)) as response:
                if response.status == 200:
                    data = await response.json()
                    available_models = [m.get('name', '') for m in data.get('models', [])]
                    print(f"[OllamaClient] ✅ Ollama is running. Available models: {len(available_models)}")
                    return True
                else:
                    print(f"[OllamaClient] ❌ Ollama returned status {response.status}")
                    return False
        except Exception as e:
            print(f"[OllamaClient] ❌ Health check failed: {e}")
            print(f"[OllamaClient] Ensure Ollama is running: ollama serve")
            return False
    
    async def preload_models(self) -> bool:
        """
        Preload all 3 models into memory for faster inference
        
        Returns:
            bool: True if all models loaded successfully
        """
        if self._preloaded:
            print("[OllamaClient] Models already preloaded")
            return True
        
        print("[OllamaClient] Preloading models into memory...")
        success_count = 0
        
        for role, config in self.models.items():
            try:
                print(f"[OllamaClient] Loading {config.name} ({role})...")
                
                # Send a minimal prompt to load model into memory
                result = await self._call_model_internal(
                    model_name=config.name,
                    prompt="Hello",
                    max_tokens=10,
                    temperature=0.1,
                    timeout=60  # First load can be slow
                )
                
                if result:
                    print(f"[OllamaClient] ✅ {config.name} loaded successfully")
                    success_count += 1
                else:
                    print(f"[OllamaClient] ⚠️ Failed to load {config.name}")
                    
            except Exception as e:
                print(f"[OllamaClient] ❌ Error loading {config.name}: {e}")
        
        self._preloaded = (success_count == len(self.models))
        
        if self._preloaded:
            print(f"[OllamaClient] ✅ All {success_count} models preloaded successfully")
        else:
            print(f"[OllamaClient] ⚠️ Only {success_count}/{len(self.models)} models loaded")
        
        return self._preloaded
    
    async def _call_model_internal(
        self,
        model_name: str,
        prompt: str,
        max_tokens: int = 2000,
        temperature: float = 0.3,
        timeout: int = 30,
        retry_count: int = 3
    ) -> Optional[str]:
        """
        Internal method to call Ollama API with retry logic
        
        Args:
            model_name: Name of the Ollama model
            prompt: Prompt to send
            max_tokens: Maximum tokens to generate
            temperature: Sampling temperature
            timeout: Request timeout in seconds
            retry_count: Number of retries on failure
            
        Returns:
            Generated text or None on failure
        """
        session = await self._get_session()
        
        payload = {
            "model": model_name,
            "prompt": prompt,
            "stream": False,
            "options": {
                "num_predict": max_tokens,
                "temperature": temperature
            }
        }
        
        for attempt in range(retry_count):
            try:
                async with session.post(
                    f"{self.api_url}/generate",
                    json=payload,
                    timeout=aiohttp.ClientTimeout(total=timeout)
                ) as response:
                    
                    if response.status == 200:
                        data = await response.json()
                        return data.get("response", "").strip()
                    else:
                        error_text = await response.text()
                        print(f"[OllamaClient] API error {response.status}: {error_text}")
                        
            except asyncio.TimeoutError:
                print(f"[OllamaClient] Timeout on attempt {attempt + 1}/{retry_count}")
                if attempt < retry_count - 1:
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                    
            except Exception as e:
                print(f"[OllamaClient] Error on attempt {attempt + 1}/{retry_count}: {e}")
                if attempt < retry_count - 1:
                    await asyncio.sleep(2 ** attempt)
        
        return None
    
    async def call_model(
        self,
        model_role: str,
        prompt: str,
        max_tokens: Optional[int] = None,
        temperature: Optional[float] = None
    ) -> Optional[str]:
        """
        Call a specific model by role
        
        Args:
            model_role: Role identifier ("query_understanding" | "generation" | "verification")
            prompt: Prompt to send to the model
            max_tokens: Override default max tokens
            temperature: Override default temperature
            
        Returns:
            Generated text or None on failure
        """
        if model_role not in self.models:
            raise ValueError(f"Unknown model role: {model_role}. Valid roles: {list(self.models.keys())}")
        
        config = self.models[model_role]
        
        return await self._call_model_internal(
            model_name=config.name,
            prompt=prompt,
            max_tokens=max_tokens or config.max_tokens,
            temperature=temperature or config.temperature,
            timeout=config.timeout
        )
    
    async def call_model_json(
        self,
        model_role: str,
        prompt: str,
        max_tokens: Optional[int] = None
    ) -> Optional[Dict]:
        """
        Call model and parse JSON response
        
        Args:
            model_role: Role identifier
            prompt: Prompt (should instruct model to return JSON)
            max_tokens: Override default max tokens
            
        Returns:
            Parsed JSON dict or None on failure
        """
        response = await self.call_model(
            model_role=model_role,
            prompt=prompt,
            max_tokens=max_tokens,
            temperature=0.1  # Low temperature for structured output
        )
        
        if not response:
            return None
        
        # Clean up markdown code blocks if present
        cleaned = response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()
        
        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            print(f"[OllamaClient] JSON parse error: {e}")
            print(f"[OllamaClient] Raw response: {response[:200]}...")
            return None
    
    def get_model_info(self) -> Dict[str, str]:
        """
        Get information about configured models
        
        Returns:
            Dict mapping role to model name
        """
        return {role: config.name for role, config in self.models.items()}


# Singleton instance
_ollama_client: Optional[OllamaClient] = None


async def get_ollama_client() -> OllamaClient:
    """
    Get or create singleton Ollama client instance
    
    Returns:
        Initialized OllamaClient
    """
    global _ollama_client
    
    if _ollama_client is None:
        _ollama_client = OllamaClient()
        
        # Health check
        if not await _ollama_client.health_check():
            raise RuntimeError(
                "Ollama server is not accessible. "
                "Please start Ollama: 'ollama serve' and ensure models are installed."
            )
        
        # Preload models
        await _ollama_client.preload_models()
    
    return _ollama_client


async def shutdown_ollama_client():
    """Cleanup function to close the client session"""
    global _ollama_client
    if _ollama_client:
        await _ollama_client.close()
        _ollama_client = None

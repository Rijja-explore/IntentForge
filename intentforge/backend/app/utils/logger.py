"""
Logging Utility for IntentForge
Structured logging with performance tracking
"""

import logging
import time
from functools import wraps
from typing import Any, Callable
from datetime import datetime
import sys


def setup_logger(name: str, log_level: str = "INFO") -> logging.Logger:
    """
    Setup structured logger with consistent formatting
    
    Args:
        name: Logger name
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
    
    Returns:
        Configured logger instance
    """
    logger = logging.getLogger(name)
    logger.setLevel(getattr(logging, log_level.upper()))
    
    # Avoid duplicate handlers
    if logger.handlers:
        return logger
    
    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, log_level.upper()))
    
    # Formatter
    formatter = logging.Formatter(
        fmt='%(asctime)s | %(name)s | %(levelname)s | %(funcName)s:%(lineno)d | %(message)s',
        datefmt='%Y-%m-%d %H:%M:%S'
    )
    console_handler.setFormatter(formatter)
    
    logger.addHandler(console_handler)
    
    return logger


def get_logger(name: str) -> logging.Logger:
    """
    Get or create logger instance
    
    Args:
        name: Logger name (typically __name__)
    
    Returns:
        Logger instance
    """
    return setup_logger(name)


def log_execution_time(logger: logging.Logger = None):
    """
    Decorator to log function execution time
    Critical for fintech performance monitoring
    
    Args:
        logger: Logger instance (optional)
    
    Usage:
        @log_execution_time(logger)
        def my_function():
            pass
    """
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def async_wrapper(*args, **kwargs) -> Any:
            _logger = logger or get_logger(func.__module__)
            start_time = time.perf_counter()
            
            try:
                result = await func(*args, **kwargs)
                execution_time = (time.perf_counter() - start_time) * 1000
                _logger.info(
                    f"{func.__name__} executed in {execution_time:.2f}ms"
                )
                return result
            except Exception as e:
                execution_time = (time.perf_counter() - start_time) * 1000
                _logger.error(
                    f"{func.__name__} failed after {execution_time:.2f}ms: {str(e)}"
                )
                raise
        
        @wraps(func)
        def sync_wrapper(*args, **kwargs) -> Any:
            _logger = logger or get_logger(func.__module__)
            start_time = time.perf_counter()
            
            try:
                result = func(*args, **kwargs)
                execution_time = (time.perf_counter() - start_time) * 1000
                _logger.info(
                    f"{func.__name__} executed in {execution_time:.2f}ms"
                )
                return result
            except Exception as e:
                execution_time = (time.perf_counter() - start_time) * 1000
                _logger.error(
                    f"{func.__name__} failed after {execution_time:.2f}ms: {str(e)}"
                )
                raise
        
        # Return appropriate wrapper based on function type
        import asyncio
        if asyncio.iscoroutinefunction(func):
            return async_wrapper
        return sync_wrapper
    
    return decorator

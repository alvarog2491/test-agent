import signal
import sys
import logging
from functools import wraps

logger = logging.getLogger(__name__)

def timeout_limit(seconds):
    """
    Decorator that enforces a hard execution limit on a function.
    If the limit is reached, the process is terminated with an error code.
    """
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            def signal_handler(signum, frame):
                logger.error(f"CRITICAL: Function '{func.__name__}' timed out after {seconds} seconds. Terminating process.")
                sys.exit(1)

            # Register the signal and set the alarm
            signal.signal(signal.SIGALRM, signal_handler)
            signal.alarm(seconds)
            
            try:
                result = func(*args, **kwargs)
            finally:
                # Disable the alarm if the function finishes before the timeout
                signal.alarm(0)
            return result
        return wrapper
    return decorator

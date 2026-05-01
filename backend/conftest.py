import sys
import os

# Add backend root to sys.path so tests can import 'main' and 'services'
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

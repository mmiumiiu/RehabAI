FROM python:3.11-slim

WORKDIR /app

# Install torch CPU-only first (separate layer so it's cached between deploys)
RUN pip install --no-cache-dir torch==2.3.1+cpu --extra-index-url https://download.pytorch.org/whl/cpu

# Install remaining deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code (changes frequently — comes after deps)
COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--log-level", "warning"]
